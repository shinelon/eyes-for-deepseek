# sensenova-vision-mcp

基于商汤 **SenseNova 6.7 Flash-Lite**（原生多模态智能体模型）的 MCP server，提供图像识别能力。配置驱动结构，工具集与 zai-mcp-server 对齐（除视频分析）。支持单图与多图输入。

## 工具（7 个）

| 工具 | 入参 | 作用 |
|------|------|------|
| `analyze_image` | `image`, `prompt` | 通用图像分析（万能入口） |
| `extract_text` | `image`, `format?` | OCR 文字提取（plain / markdown） |
| `ui_to_artifact` | `image`, `output_type`, `prompt?` | UI 截图转产物：`code` / `prompt` / `spec` / `description` |
| `diagnose_error` | `image`, `context?` | 错误截图诊断（根因 + 修复） |
| `understand_technical_diagram` | `image`, `diagram_type?`, `prompt` | 技术图表理解（架构/流程/UML/ER/时序） |
| `analyze_data_visualization` | `image`, `analysis_focus?`, `prompt` | 数据可视化分析（图表/仪表盘） |
| `ui_diff_check` | `expected_image`, `actual_image`, `prompt` | 双图 UI 对比（设计稿 vs 实现） |

`image` 参数统一支持：本地文件路径 / 公网 URL / `data:` base64。`ui_diff_check` 接收两张图。

## 环境变量

| 变量 | 必填 | 默认 | 说明 |
|------|:---:|------|------|
| `SENSENOVA_API_KEY` | 是 | — | 商汤 API Key |
| `SENSENOVA_BASE_URL` | 否 | `https://token.sensenova.cn/v1` | OpenAI 兼容端点 |
| `SENSENOVA_MODEL` | 否 | `sensenova-6.7-flash-lite` | 视觉模型 |

## 构建

```bash
npm install
npm run build
```

## 接入 opencode（项目级 `opencode.json`）

```json
{
  "mcp": {
    "sensenova-vision": {
      "type": "local",
      "command": ["node", "D:/opencode_space/local_mcp/sensenova-vision-mcp/dist/index.js"],
      "environment": {
        "SENSENOVA_API_KEY": "{env:SENSENOVA_API_KEY}",
        "SENSENOVA_BASE_URL": "https://token.sensenova.cn/v1"
      },
      "enabled": true
    }
  }
}
```

## 架构（配置驱动 + 多图支持）

```
src/
├── image.ts            # 图片输入归一化（path/url/base64 → data URL）
├── sensenova-client.ts # 商汤 API 调用内核（analyzeImages 支持多图 content 数组）
├── tools.ts            # 工具配置表（ToolDef 含 imageParams 字段）
└── index.ts            # 循环注册工具 + 多图提取 + 启动 stdio server
```

所有工具共享 `analyzeImages(dataUrls[], systemPrompt, userPrompt)` 内核。`ToolDef.imageParams` 声明哪些参数是图片源（单图 `["image"]`，双图 `["expected_image","actual_image"]`），handler 据此提取并归一化。新增工具只需在 `tools.ts` 加一个配置对象。

## 备注

- `max_tokens` 默认 4096（该模型为推理模型，max_tokens 含 reasoning，故需比纯文本模型大；空响应通常是 token 耗尽，代码已加 fallback 提示）。
- 支持图片格式：jpg / jpeg / png；建议长边 ≤2048px 节省 tokens。
- 多图输入（`ui_diff_check`）由 sensenova 官方文档 7.5 节支持。
- API 文档：https://github.com/OpenSenseNova/SenseNova6.7/blob/main/API_CN.md
