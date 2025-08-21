# Markdown BibTeX 引用系统使用说明

## 概述
本系统为markdown文件提供了完整的学术引用功能，支持bibtex格式的参考文献管理和引用。

## 功能特性
- ✅ 支持所有bibtex条目类型（@ARTICLE, @BOOK, @INPROCEEDINGS等）
- ✅ 内联引用语法：`[@citation_key]`
- ✅ 多个引用：`[@key1, @key2]`
- ✅ 自动生成参考文献列表
- ✅ 兼容所有支持bibtex的markdown渲染器

## 使用方法

### 1. 添加引用
在正文中使用以下语法添加引用：
```markdown
这是一个引用示例[@watterson1990optimum]。

多个引用可以这样使用[@gallager1962low, @mackay1996near]。
```

### 2. 管理BibTeX库
在markdown文件末尾添加bibtex代码块：
````markdown
## 参考文献

```bibtex
@ARTICLE{citation_key,
  author={作者姓名},
  title={文章标题},
  journal={期刊名称},
  year={年份},
  volume={卷号},
  number={期号},
  pages={页码},
  doi={DOI号}
}
```
````

### 3. 支持的BibTeX条目类型
- `@ARTICLE` - 期刊文章
- `@BOOK` - 书籍
- `@INPROCEEDINGS` - 会议论文
- `@TECHREPORT` - 技术报告
- `@PHDTHESIS` - 博士学位论文
- `@MASTERSTHESIS` - 硕士学位论文

## 示例

### 引用示例
```markdown
在Neural Receiver的研究中，Watterson等人[@watterson1990optimum]提出了一个用于信号检测的最优多层感知器神经网络接收器。
```

### BibTeX条目示例
```bibtex
@ARTICLE{watterson1990optimum,
  author={Watterson, J.W.},
  journal={IEEE Transactions on Neural Networks}, 
  title={An optimum multilayer perceptron neural receiver for signal detection}, 
  year={1990},
  volume={1},
  number={4},
  pages={298-300},
  doi={10.1109/72.80267}
}
```

## 兼容性
本引用系统兼容以下markdown渲染器：
- Typora
- Obsidian
- VS Code (with extensions)
- Pandoc
- 支持bibtex的学术markdown工具

## 注意事项
1. 确保每个引用都有对应的bibtex条目
2. 引用键（citation_key）必须唯一
3. 建议使用有意义的引用键名称
4. DOI号有助于读者查找原文

## 扩展功能
可以根据需要添加以下功能：
- 自动编号引用
- 按引用顺序排序参考文献
- 支持更多bibtex字段
- 导出为其他格式（如LaTeX、Word等）
