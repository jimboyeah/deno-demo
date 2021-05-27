/**
 * 开放平台用户类型：
 *
 *    - 普通用户
 *    - 行业/企业服务商
 *    - 企业号用户
 *
 * 权限类型及权限模块：
 *
 *    - 基础能力权限 - 抖音分享 帐号授权 用户管理 内容/视频管理 互动管理 搜索管理 数据开放服务 工具能力
 *    - 生活服务类开发者专属权限 - 生活服务开放能力
 *    - 企业号开发者专属权限 - 企业号开放能力
 *
 * ⚠️ 通过开放平台应用申请得到 client key，client secret，开发者请妥善保管不可暴露。
 * 为保证开发者的应用安全，需要开发者拥有保存临时凭据 AccessToken 的后端服务。
 *
 * 抖音开放平台能力图谱
 *
 * 账号登录
 *
 *    - 通用用户信息获取，包括昵称、头像等
 *    - 公开信息，包含昵称、头像、性别和地区以及西瓜和头条的公开信息；
 *    - 获取抖音用户最近的粉丝列表，不保证顺序，目前可查询的粉丝数上限5000；
 *    - 获取抖音用户的关注列表
 *    - 第三方用户更便捷登录，降低注册/登录的成本 用户信息获取接入方案
 *
 * 视频分享
 *
 *    1.视频编辑、分享和发布，分享更多UGC内容到抖音
 *    2.携带指定话题和小程序
 *    3.获取分享内容消费数据
 *    2.内容营销价值
 *
 * 数据榜单
 *
 *    - 数据开放，打造影视，综艺榜单，输出星图、星图达人指数数据榜单等
 *    - 数据分析，辅助决策
 *    - 榜单数据接入方案
 *    - 获取抖音电影榜、抖音电视剧榜、抖音综艺榜
 *    - 获取抖音星图达人热榜
 *
 * 矩阵账号
 *
 *    - 管理下设栏目，各类达人（公司员工）帐号等
 *    - 分析、管理所属账号信息，辅助运营决策
 *
 * 客服咨询、用户管理
 *
 *    - 评论回复
 *    - 结合企业号意向用户管理，评论回复等，做好用户关系维护
 *    - 视频评论管理接入方案
 *    - 评论列表
 *
 * @see 抖音开放平台申请流程 https://open.douyin.com/platform/doc/6850392241249191950
 * @see 通用解决方案能力列表 https://open.douyin.com/platform/doc/6903355871238031367
 * @see 用户类型及权限说明 https://open.douyin.com/platform/doc/6855240178122983437
 * @class DouYinSdk
 */
export declare class DouYinSdk {
    private clientKey;
    private clientSecret;
    /**
     * Creates an instance of DouYinSdk.
     *
     * ⚠️ 通过开放平台应用申请得到 client key，client secret，开发者请妥善保管不可暴露。
     *
     * @param {string} clientKey
     * @param {string} clientSecret
     * @memberof DouYinSdk
     */
    constructor(clientKey: string, clientSecret: string);
    log(...args: any): void;
}
export default DouYinSdk;
/**
 * 抖音平台能力  API Scope
 * @see 用户类型及权限说明 https://open.douyin.com/platform/doc/6855240178122983437#desc-2
 * @enum {string}
 */
export declare enum Ability {
    /**
     * 抖音分享
     * - 第三方App内容分享到抖音主页 无需申请 默认开启
     * - 分享携带话题能力 无需申请 默认开启
     * - 分享携带小程序能力 无需申请 默认开启
     * - 获取分享是否成功的结果 无需申请 默认开启
     * - 应用分享内容数据统计 无需申请 默认开启
     */
    AwemeShare = "aweme.share",
    /**
     * 分享携带来源标签
     * - 分享携带来源标签，用户可点击标签进入转化页 特殊权限 默认关闭 管理中心申请
     */
    ShareWithSource = "share_with_source",
    /**
     * 分享给抖音好友
     * - 第三方App内容私信分享给抖音好友 普通权限 默认关闭 管理中心申请
     */
    ImShare = "im.share",
    /**
     * 授权登录 用抖音账号登录第三方平台
     * - 无需申请 默认开启
     * - 返回抖音用户公开信息 无需申请 默认开启
     */
    UserInfo = "user_info",
    /**
     * 静默授权
     * - 直接获取该用户的open id 特殊权限 默认关闭 管理中心申请
     */
    LoginID = "login_id",
    /**
     * 授权有效期动态续期
     * - refresh_token支持动态续期，每次续期+30天，续期次数上限为5次 普通权限 默认关闭 管理中心申请
     */
    RenewRefreshToken = "renew_refresh_token",
    /**
     * 用户管理
     * - 获取该用户的关注列表 普通权限 默认关闭 管理中心申请
     */
    FollowingList = "following.list",
    /**
     * - 获取该用户的粉丝列表 普通权限 默认关闭 管理中心申请
     */
    FansList = "fans.list",
    /**
     * 获取用户手机号
     * - 用抖音帐号登录第三方平台，获得用户在抖音上的手机号码 特殊权限 默认关闭 管理中心申请
     */
    Mobile = "mobile",
    MobileAlert = "mobile_alert",
    /**
     * 抖音视频发布及管理
     * - 视频发布及管理 一键发布视频 普通权限 默认关闭 管理中心申请
     * - 一键发布单图 普通权限 默认关闭 管理中心申请
     * - 发布携带话题 无需申请 默认开启
     * - 今日头条 视频发布及管理 发布视频到头条 普通权限 默认关闭 管理中心申请
     * - 授权用户头条视频数据获取 普通权限 默认关闭 管理中心申请
     * - 指定头条视频数据获取 普通权限 默认关闭 管理中心申请
     * - 发布携带小程序 无需申请 默认开启
     */
    VideoCreate = "video.create",
    /**
     * - 删除内容 普通权限 默认关闭 管理中心申请
     */
    VideoDelete = "video.delete",
    /**
     * - 查询授权用户的抖音视频数据 普通权限 默认关闭 管理中心申请
     */
    VideoData = "video.data",
    /**
     * - 查询特定抖音视频的视频数据 普通权限 默认关闭 管理中心申请
     */
    VideoList = "video.list",
    /**
     * 查询POI信息
     * - 查询地点信息，发布时携带位置标签 特殊权限 默认关闭 管理中心申请
     */
    PoiSearch = "poi.search",
    /**
     * 互动管理
     * - 评论管理（普通用户） 获取并管理评论 普通权限 默认关闭 管理中心申请
     */
    ItemComment = "item.comment",
    /**
     * 互动管理（企业号）
     * - 获取并管理评论（企业号） 普通权限 默认关闭 管理中心申请
     */
    VideoComment = "video.comment",
    /**
     * - 接收及回复私信（企业号） 普通权限 默认关闭 管理中心申请
     */
    IM = "im",
    /**
     * 搜索管理 关键词视频管理 包含通过关键词获取抖音视频及该视频下评论，并进行回复的能力 特殊权限 默认关闭 管理中心申请
     */
    VideoSearch = "video.search",
    /**
     * 用户数据
     * - 查询用户的获赞、评论、分享，主页访问等相关数据 抖音数据权限 默认关闭 管理中心申请
     */
    DataExternalUser = "data.external.user",
    /**
     * 视频数据
     * - 查询作品的获赞，评论，分享等相关数据 抖音数据权限 默认关闭 管理中心申请
     */
    DataExternalItem = "data.external.item",
    /**
     * 粉丝画像数据
     * - 获取用户粉丝画像数据 抖音数据权限 默认关闭 管理中心申请
     */
    FansData = "fans.data",
    /**
     * 抖音热点
     * - 获取抖音热门内容 抖音数据权限 默认关闭 管理中心申请
     */
    HotSearch = "hotsearch",
    /**
     * 星图数据
     * - 星图达人与达人对应各指数评估分，以及星图6大热门维度下的达人榜单 抖音数据权限 默认关闭 管理中心申请
     */
    StarTops = "star_tops",
    StarTopScoreDisplay = "star_top_score_display",
    StarAuthorScoreDisplay = "star_author_score_display",
    /**
     * 抖音影视综榜单数据
     * - 查询抖音电影榜、抖音剧集榜、抖音综艺榜数据 定向开通 默认关闭 定向开通
     */
    DiscoveryEnt = "discovery.ent",
    /**
     * SDK分享视频数据
     * - 获取用户通过分享SDK分享视频数据 抖音数据权限 默认关闭 管理中心申请
     */
    DataExternalSdkShare = "data.external.sdk_share"
}
