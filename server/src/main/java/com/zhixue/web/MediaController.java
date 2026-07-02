package com.zhixue.web;

import com.zhixue.entity.MediaEntity;
import com.zhixue.repo.MediaRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

// 媒体对象存储：讲解视频等大文件存磁盘（不进关系库），DB 仅存元数据；支持 Range 流式播放。
// 可插拔：日后换 MongoDB GridFS / MinIO / OSS 时，只需替换 store/serve 两处实现。
@RestController
@RequestMapping("/api")
public class MediaController {
    private final MediaRepo repo;
    private final Path dir;

    public MediaController(MediaRepo repo, @Value("${media.dir:./data/media}") String mediaDir) {
        this.repo = repo;
        this.dir = Paths.get(mediaDir).toAbsolutePath();
    }

    @PostMapping("/media")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        Files.createDirectories(dir);
        String id = UUID.randomUUID().toString().replace("-", "");
        String orig = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        int dot = orig.lastIndexOf('.');
        String ext = dot >= 0 ? orig.substring(dot) : "";
        Path target = dir.resolve(id + ext);
        file.transferTo(target.toFile());

        MediaEntity m = new MediaEntity();
        m.id = id;
        m.filename = orig;
        m.contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        m.size = file.getSize();
        m.storagePath = target.toString();
        m.createdAt = System.currentTimeMillis();
        repo.save(m);

        return Map.of("id", id, "url", "/api/media/" + id, "name", orig, "size", file.getSize());
    }

    @GetMapping("/media/{id}")
    public void serve(@PathVariable String id, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        MediaEntity m = repo.findById(id).orElse(null);
        if (m == null) { resp.sendError(404); return; }
        File f = new File(m.storagePath);
        if (!f.exists()) { resp.sendError(404); return; }

        long len = f.length();
        resp.setContentType(m.contentType != null ? m.contentType : "application/octet-stream");
        resp.setHeader("Accept-Ranges", "bytes");

        long start = 0, end = len - 1;
        String range = req.getHeader("Range");
        if (range != null && range.startsWith("bytes=")) {
            String[] parts = range.substring(6).split("-");
            try { start = Long.parseLong(parts[0].trim()); } catch (Exception ignore) {}
            if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                try { end = Long.parseLong(parts[1].trim()); } catch (Exception ignore) {}
            }
            if (start > end || start >= len) {
                resp.setStatus(416);
                resp.setHeader("Content-Range", "bytes */" + len);
                return;
            }
            resp.setStatus(206);
            resp.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + len);
        } else {
            resp.setStatus(200);
        }

        long count = end - start + 1;
        resp.setContentLengthLong(count);
        try (RandomAccessFile raf = new RandomAccessFile(f, "r"); OutputStream os = resp.getOutputStream()) {
            raf.seek(start);
            byte[] buf = new byte[64 * 1024];
            long remaining = count;
            int r;
            while (remaining > 0 && (r = raf.read(buf, 0, (int) Math.min(buf.length, remaining))) != -1) {
                os.write(buf, 0, r);
                remaining -= r;
            }
        }
    }
}
