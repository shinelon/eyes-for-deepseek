# eyes-for-deepseek

> 给 DeepSeek 装上眼睛 👀 —— 让 DeepSeek 等纯文本大模型拥有视觉能力

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![MCP](https://img.shields.io/badge/MCP-Server-blue) ![Free](https://img.shields.io/badge/免费额度-每5h_1500次-success)

DeepSeek 很强，但它**看不见图片**：截图、图表、UI 设计稿、错误信息、文档扫描件——统统无法理解。`eyes-for-deepseek` 通过 [MCP（Model Context Protocol）](https://modelcontextprotocol.io) 为 DeepSeek 接入一组视觉工具，让它能"看图说话"。

视觉能力由商汤 **SenseNova 6.8 Flash-Lite**（原生多模态智能体模型）提供，**注册即享免费额度**，零成本起步；工具代码 MIT 开源。

---

## 为什么需要它？

| 痛点 | eyes-for-deepseek 的解法 |
|------|------|
| DeepSeek 是纯文本模型，无法处理图像 | MCP 工具集提供 7 种视觉能力，DeepSeek 按需调用 |
| GPT-4V / Claude Vision 按量收费，成本高 | 商汤 SenseNova 免费公测，每 5 小时 1500 次免费调用 |
| 自建多模态模型门槛高、部署复杂 | 开箱即用的 MCP server，配置即用，OpenAI 兼容 API |

---

## 它是什么？

一个**配置驱动的 MCP 视觉工具集**，专为 DeepSeek 设计，架构上同样适用于任何纯文本 LLM。

- **7 个视觉工具**：通用识图、OCR、UI 转代码、错误诊断、图表理解、数据可视化分析、双图对比
- **视觉后端**：商汤 SenseNova 6.8 Flash-Lite（原生多模态，"看、想、做"一体化）
- **配置驱动**：所有工具共享一个推理内核，新增工具只需加一个配置对象
- **可扩展**：当前后端为 SenseNova，架构预留接入其他视觉模型的空间

---

## 免费额度

视觉能力基于商汤 **SenseNova Token Plan 免费公测**：

- **注册即领**，无门槛
- `sensenova-6.8-flash-lite`：**每 5 小时 1500 次**免费调用
- OpenAI 兼容 API，接入简单
- 领取地址：https://platform.sensenova.cn/console

> 说明：免费额度由商汤官方提供、按周期刷新（详见官方政策）。本项目代码本身 MIT 开源、免费使用。

---

## 能力清单（7 个工具）

| 工具 | 入参 | 作用 |
|------|------|------|
| `analyze_image` | `image`, `prompt` | 通用图像分析（万能入口） |
| `extract_text` | `image`, `format?` | OCR 文字提取（plain / markdown） |
| `ui_to_artifact` | `image`, `output_type`, `prompt?` | UI 截图转产物：`code` / `prompt` / `spec` / `description` |
| `diagnose_error` | `image`, `context?` | 错误截图诊断（根因 + 修复建议） |
| `understand_technical_diagram` | `image`, `diagram_type?`, `prompt` | 技术图表理解（架构/流程/UML/ER/时序） |
| `analyze_data_visualization` | `image`, `analysis_focus?`, `prompt` | 数据可视化分析（图表/仪表盘） |
| `ui_diff_check` | `expected_image`, `actual_image`, `prompt` | 双图 UI 对比（设计稿 vs 实现） |

`image` 参数统一支持：本地文件路径（jpg / jpeg / png）/ 公网 URL / `data:` base64。`ui_diff_check` 接收两张图。

---

## 快速开始

### 1. 获取 SenseNova API Key

访问 https://platform.sensenova.cn/console 注册，领取免费额度并创建 API Key。

### 2. 构建服务

```bash
git clone https://github.com/shinelon/eyes-for-deepseek.git
cd eyes-for-deepseek/sensenova-vision-mcp
npm install
npm run build
```

### 3. 接入 MCP 客户端

以 [opencode](https://opencode.ai) 为例，在工作目录的 `opencode.json` 中配置：

```json
{
  "mcp": {
    "sensenova-vision": {
      "type": "local",
      "command": ["node", "<dist/index.js 的路径>"],
      "environment": {
        "SENSENOVA_API_KEY": "{env:SENSENOVA_API_KEY}"
      },
      "enabled": true
    }
  }
}
```

**`command` 中的路径指向构建产物 `dist/index.js`，按使用场景填写（路径相对于 `opencode.json` 所在目录解析）：**

| 场景 | 路径写法 |
|------|---------|
| 在本仓库内自测（`opencode.json` 放仓库根） | `./sensenova-vision-mcp/dist/index.js` |
| 在任意其他项目接入（推荐，最稳妥） | 用绝对路径，如 `D:/path/to/eyes-for-deepseek/sensenova-vision-mcp/dist/index.js` |

> 拿不准就用绝对路径，可避免相对路径解析问题。

**环境变量：**

- `{env:SENSENOVA_API_KEY}` 是 opencode 的插值语法——运行时从进程环境读取 `SENSENOVA_API_KEY`，需先在系统中设置该变量：

```bash
# Linux / macOS / Git Bash（当前会话）
export SENSENOVA_API_KEY=你的key

# Windows PowerShell（永久）
setx SENSENOVA_API_KEY "你的key"
```

- 其他 MCP 客户端（Claude Desktop、Cursor 等）**不支持** `{env:...}` 语法，请在配置中直接填入 API Key 值；配置文件名与结构也略有差异，参考各客户端文档。

设置完成后启动客户端，DeepSeek 即可调用这些视觉工具。

### 环境变量

| 变量 | 必填 | 默认 | 说明 |
|------|:---:|------|------|
| `SENSENOVA_API_KEY` | 是 | — | 商汤 API Key（未设置则调用时抛错） |
| `SENSENOVA_BASE_URL` | 否 | `https://token.sensenova.cn/v1` | OpenAI 兼容端点 |
| `SENSENOVA_MODEL` | 否 | `sensenova-6.8-flash-lite` | 视觉模型 |

---

## 架构

```
sensenova-vision-mcp/
└── src/
    ├── image.ts            # 图片输入归一化（path/url/base64 → data URL）
    ├── sensenova-client.ts # 商汤 API 调用内核（analyzeImages 支持多图）
    ├── tools.ts            # 工具配置表（ToolDef，含 imageParams 字段）
    └── index.ts            # 循环注册工具 + 启动 stdio server
```

所有工具共享 `analyzeImages(dataUrls[], systemPrompt, userPrompt)` 内核。`ToolDef.imageParams` 声明哪些参数是图片源（单图 `["image"]`、双图 `["expected_image","actual_image"]`），handler 据此提取并归一化。**新增工具只需在 `tools.ts` 加一个配置对象**，无需改 `index.ts`。

---

## 路线图

- [ ] 接入更多视觉后端（开源多模态模型等）
- [ ] 扩充工具集（视频理解、文档解析等）
- [ ] 补充更多 DeepSeek 视觉用例

> 项目名锚定 DeepSeek，但架构通用——欢迎为其他纯文本 LLM 接入。

---

## 贡献

欢迎提 Issue 和 PR。新增视觉工具只需在 `sensenova-vision-mcp/src/tools.ts` 添加一个 `ToolDef` 配置对象，详见子包 [README](./sensenova-vision-mcp/README.md)。

## License

MIT

## 致谢

- [商汤 SenseNova](https://www.sensenova.cn/) — 视觉模型与免费额度
- [Model Context Protocol](https://modelcontextprotocol.io) — 工具协议
- [DeepSeek](https://www.deepseek.com) — 纯文本 LLM
