## wandb配置
> *本文纯纯记录自己的愚蠢*

### 1.mac
> *具体环境 macos  python3.9.6  wandb,version 0.21.0*

确实是很久没用mac写python了，实习的时候都是用的win学习的，所以犯了一些很蠢的问题，

#### 1.1关于pip

我人都傻了，我之前明明用过 *pip* 啊，本人感觉非常非常奇怪🤔
```zsh
% pip install wandb
zsh: command not found: pip
```
之后小罗发现自己有多个版本的python，而python3对应的是3.13，而python对应的是3.9
```zsh
% python3 --version
Python 3.13.5
% python --version
Python 3.9.6
```
系统的python环境应该是3.9.6，而3.13是之后用homebrew加装的
```zsh
% which python3
/opt/homebrew/bin/python3
% which python
python: aliased to /usr/bin/python3
```
非全局版本的python不能用pip下载东西，pipx貌似可以
```zsh
% which pipx
/opt/homebrew/bin/pipx
% pipx install  wandb
'wandb' already seems to be installed.
%之后要用pip
python -m pip install xx
```
再次强调，pipx属于3.13，非全局。
但是其实这些都不是问题，因为一般来说都会进虚拟环境吧，什么年代了，怎么只有小罗还在激情python text.py

```zsh
# 1. 删除旧虚拟环境（如果有）
rm -rf myenv

# 2. 创建新虚拟环境
python3 -m venv myenv

# 3. 激活
source myenv/bin/activate

#4.用完之后记得关
deactivate

#ps:进了虚拟环境得用环境下的python，btw可以用pyenv管理python包
#但是下pyenv的时候又发现清华源用不了，开始以为是代理的问题，但是ping中科大又可以真实奇怪
pyenv install --list#查看可用的 Python 版本
pyenv install 3.9.7  # 安装指定Python版本
pyenv global 3.9.7  # 将全局 Python 版本设为 3.9.7
#项目中
pyenv local 3.10.6    # 指定项目使用Python 3.10.6
python -m venv myenv  # 创建名为.venv的虚拟环境
```


#### 1.2关于代理
```zsh
#查看代理
echo $http_proxy
echo $https_proxy
#临时设置代理（当前终端会话有效）ps:端口和vpn一致哈，127.0.0.1 是本地主机地址
export http_proxy=http://代理服务器IP:端口
export https_proxy=http://代理服务器IP:端口
#取消代理（临时取消）
unset http_proxy
unset https_proxy
```

#### 关于conda
```zsh
# 创建新环境（指定 Python 版本）
conda create -n myenv python=3.9

# 激活环境
conda activate myenv

# 退出当前环境
conda deactivate

# 删除环境
conda remove -n myenv --all

# 查看已创建的环境
conda env list

# 导出环境到 yml 文件
conda env export > environment.yml

# 根据 yml 文件创建环境
conda env create -f environment.yml
```

### 2.使用wandb
> 刚开始浪费很多时间，而且以为只能先离线训练再上传实则不然
```zsh
#在训练文件中，设置环境变量
os.environ["WANDB_MODE"]="offline"
#命令行跑下面的代码 注意 换成自己结果目录
WANDB_BASE_URL=https://api.bandw.top wandb sync  ./wandb/offline-run-20250729_210116-wds9z56w 
#ps:换成online依旧正常工作
```

