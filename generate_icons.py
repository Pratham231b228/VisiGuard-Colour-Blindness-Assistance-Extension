
"""Generate simple placeholder icons for the ChromaAid extension."""
import os, struct, zlib

def create_png(size, filename):
    """Create a minimal valid PNG with a colored circle."""
    pixels = []
    cx = cy = size // 2
    r = size // 2 - 1
    for y in range(size):
        row = []
        for x in range(size):
            dx, dy = x - cx, y - cy
            if dx*dx + dy*dy <= r*r:
        
                row += [0x16, 0x16, 0x1c, 255]  
                inner_r = r * 0.6
                if dx*dx + dy*dy <= inner_r*inner_r:
                    row[-4:] = [0xc8, 0xf0, 0x6e, 255]  
            else:
                row += [0, 0, 0, 0]  
        pixels.append(bytes(row))

    def make_chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    raw = b''.join(b'\x00' + row for row in pixels)
    idat = zlib.compress(raw)

    png = b'\x89PNG\r\n\x1a\n'
    png += make_chunk(b'IHDR', ihdr)
    png += make_chunk(b'IDAT', idat)
    png += make_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Created {filename}")

os.makedirs('icons', exist_ok=True)
create_png(16, 'icons/icon16.png')
create_png(48, 'icons/icon48.png')
create_png(128, 'icons/icon128.png')
print("Icons created successfully!")
