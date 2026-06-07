# 3D模型资源目录

此目录用于存放猫咪解剖3D模型文件（GLTF/GLB格式）。

## 模型文件结构

建议的模型文件命名规范：

```
models/
├── high/                    # 高精度模型（LOD Level 0，距离 < 2m）
│   ├── cat_body.glb
│   ├── skin.glb
│   ├── muscle_skeletal.glb
│   ├── muscle_deep.glb
│   ├── skeleton.glb
│   ├── organs/
│   │   ├── heart.glb
│   │   ├── lungs.glb
│   │   ├── liver.glb
│   │   ├── kidneys.glb
│   │   ├── stomach.glb
│   │   ├── intestines.glb
│   │   ├── spleen.glb
│   │   └── bladder.glb
│   └── vessels/
│       ├── aorta.glb
│       └── vena_cava.glb
├── medium/                  # 中精度模型（LOD Level 1，距离 2-5m）
│   └── ... (同上结构)
└── low/                     # 低精度模型（LOD Level 2，距离 > 5m）
    └── ... (同上结构)

# 病变模型（可选）
diseases/
├── heart_hcm.glb           # 肥厚性心肌病
├── kidney_ckd.glb          # 慢性肾病
├── lung_asthma.glb         # 猫哮喘
└── ...
```

## 模型要求

1. **格式**：优先使用 `.glb`（二进制GLTF），支持Draco压缩
2. **面数限制**：
   - 高精度：单器官 ≤ 2万面，整体 ≤ 20万面
   - 中精度：单器官 ≤ 1万面，整体 ≤ 10万面
   - 低精度：单器官 ≤ 3千面，整体 ≤ 3万面
3. **纹理**：PBR材质，纹理分辨率 ≤ 2048×2048
4. **坐标系**：Y轴向上，Z轴向前，右手坐标系
5. **缩放**：1单位 = 1米，猫咪模型高度约0.5米

## 模型Metadata

每个GLTF模型应在 `extras` 字段中包含以下元数据：

```json
{
  "extras": {
    "organId": "heart",
    "name": "心脏",
    "layer": "organ",
    "version": "1.0.0"
  }
}
```

## 占位说明

当前模型通过代码程序化生成（`src/utils/threeHelpers.ts` 中的 `createCatGeometry` 函数）。当放置真实的GLTF模型文件到此目录后，系统会自动优先加载外部模型。
