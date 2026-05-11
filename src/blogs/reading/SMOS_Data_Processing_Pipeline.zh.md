## SMOS Data Processing Pipeline Thinking
> 这篇文章记录我如何思考与设计一个庞大的SMOS数据处理pipeline。
> 先理解清楚SMOS的原理，了解数据特点
> 之后设计科学的数据处理流程与管理结构
> 最后实现高效的数据处理与分析工具，确保数据质量与可用性。
> 这篇文章的目标是为后续的SMOS数据分析与研究工作打下坚实的基础。


### System Understanding
SMOS mission is to provide the global maps of soil moisture and sea surface salinity of spatial and temporal coverage.

### Mindstorm
1. 首先要保证l1b的准确性，l1c本质没有做数据进一步的处理，只是做了一个映射。如何保证准确性，下面的疑问需要展开
* 极化模式对于数据的影响是什么？不同极化模式的数据处理流程是否不同？需要针对不同极化模式设计不同的数据处理步骤吗？
* Alias-free FOV的T才是有效的数据，需要裁剪

2. 数据如何整理
* SMOS基本上每3天覆盖一次全球，我们也把一次覆盖作为一个数据的整理单元
* 但是如何处理同一个区域的多次快找？
* RFI在不同角度的快照是否可以均值
* 如果可以点对点对应
* 交互式每一个经纬坐标的亮温数据索引

### References:
1. SMOS 架构
[1] McMullan, J. D., et al. (2008). "SMOS: The Mission and the System." IEEE Transactions on Geoscience and Remote Sensing.
2. 可见度与定标
[2] Corbella, I., et al. (2005). "The Visibility Function in Interferometric Radiometry." IEEE TGRS.
3. L1A -> L1B
[3] "A resolved inversion algorithm for synthetic aperture imaging radiometers." IEEE TGRS.