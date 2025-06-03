from PIL import Image
import pillow_heif

def convert_heic_to_jpg(input_path, output_path=None):
    heif_file = pillow_heif.read_heif(input_path)
    image = Image.frombytes(
        heif_file.mode,
        heif_file.size,
        heif_file.data
    )

    if not output_path:
        output_path = input_path.replace(".heic", ".jpg")

    image.save(output_path, "JPEG")
    print(f"Saved: {output_path}")


convert_heic_to_jpg("IMG_1870.heic")
convert_heic_to_jpg("IMG_1871.heic")


