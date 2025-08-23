from PIL import Image

def add_white_background(input_path, output_path, background_color=(255, 255, 255)):
    # 打开图片（确保是 RGBA 模式以支持透明度）
    img = Image.open(input_path).convert("RGBA")
    
    # 获取原始尺寸
    width, height = img.size
    
    # 计算正方形的边长（取最大值）
    new_size = max(width, height)
    
    # 创建白色背景的正方形画布
    background = Image.new("RGB", (new_size, new_size), background_color)
    
    # 计算居中粘贴的位置
    x = (new_size - width) // 2
    y = (new_size - height) // 2
    
    # 将原图粘贴到背景上（保留 Alpha 通道）
    background.paste(img, (x, y), img)
    
    # 保存结果
    background.save(output_path)

# 使用示例
input_image = "eic.png"
output_image = "eic_white_bg_square.png"
add_white_background(input_image, output_image)

print(f"处理完成，结果已保存为 {output_image}")

