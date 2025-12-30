---
sidebar_position: 2
---
# CSA - OAuth能力

在云梦镜像客户服务平台（CSA）应用中，平台提供了一套完善的OAuth授权流程，包含了PKCE支持。

## 新建OAuth应用

在登录[客户服务平台](https://platform.dreamreflex.com)后，左侧导航栏中选择“OAuth应用”，在OAuth应用管理中，可以新建应用。

在新建应用的信息中，填写客户端名称，重定向地址，授权模式和Scopes字段。

- 客户端名称：您的应用名称，用于在发起授权时提示当前申请的应用。
- 重定向地址：重定向地址（Redirect URI）是 OAuth 授权成功后，授权服务器把“授权码”或“token”返回给你的应用时使用的回调地址。
- 授权模式：系统支持三种授权模式，分别是`authorization_code`、`refresh_token`、`client_credentials`， 这是三种常用的 OAuth 常用授权模式（Grant Types）
- Scopes：Scopes用来声明你的应用希望访问用户的哪些资源、具备哪些权限。系统提供`openid`，`profile`，`email`，`offline_token`四种默认信息。

## 配置OAuth应用

在填写完成OAuth应用的基本信息后，点击确定即可获取`Client ID`和`Client Secret`，常规OAuth应用都会要求填写这些字段，同时OAuth应用还通常要求填写授权URL，TokenURL，UserInfoURL，Scopes等信息。在云梦镜像的认证体系中，您可以按照如下信息填写相关信息

### Client ID

在应用创建时生成，通常是一个随机字符串，这是标识用户OAuth应用的唯一ID，例如`app_jcbeo5rdpigqri4`

### Client Secret

在应用创建时生成，通常是一个随机字符串，这是允许用户OAuth应用访问系统数据的核心凭证，只会显示一次。

### Authorization URL（认证 URL）

作用：用户在授权流程中被跳转到的页面，用于让用户登录并同意授予应用访问权限。

流程中的位置：你的应用 →（跳转）→ **Authorization URL** → 用户同意授权 → 返回 Authorization Code

在云梦镜像的认证体系中，请填写：

```
https://api.dreamreflex.com/oauth/authorize
```

### Token URL（令牌 URL）

作用： 你的服务器用拿到的 **Authorization Code**（授权码）来换取 **Access Token**（访问令牌）的接口。

流程中的位置：你的服务器 → **Token URL** → 返回 Access Token / Refresh Token

在云梦镜像的认证体系中，请填写：

```
https://api.dreamreflex.com/oauth/token
```

### UserInfo URL

作用： OAuth2/OpenID Connect 提供的接口，用 Access Token 去获取用户的基本信息，例如邮箱、头像、昵称等。

流程中的位置： 你的服务器 →（带 Access Token）→ **Userinfo URL** → 返回用户资料

在云梦镜像的认证体系中，请填写：

```
https://api.dreamreflex.com/oauth/userinfo
```

### Scope

作用：告诉授权服务器你的应用需要访问哪些权限。

在云梦镜像的认证体系中，我们提供：

```
openid email profile offline_token
```

## PKCE

PKCE（Proof Key for Code Exchange）是 OAuth 2.0 授权码流程的一种安全扩展机制，主要用于防止授权码被截获后被攻击者利用。它最初是为原生应用（Native Apps）和移动应用设计的，但现在也推荐 所有使用授权码流程的客户端都采用 PKCE，包括 Web 应用。

CSA已经支持PKCE，下面的信息将会帮助您接入PKCE

### 服务端信息
- 授权服务器（Issuer）：`https://api.dreamreflex.com`
- 授权端点：`https://api.dreamreflex.com/oauth/authorize`
- 令牌端点：`https://api.dreamreflex.com/oauth/token`
- 用户信息端点：`https://api.dreamreflex.com/oauth/userinfo`
- OIDC 发现文档：`https://api.dreamreflex.com/.well-known/openid-configuration`

### 接入步骤
1) 创建客户端  
   - 在平台后台的 “OAuth 应用” 页面创建客户端并记录 `client_id`。  
   - 配置允许的回调地址 `redirect_uri`（示例：`https://platform.dreamreflex.com/oauth/callback`，也可使用你自己的已登记域名）。  
   - 授权类型选择 `authorization_code`；如需长登录可同时允许 `refresh_token`。  
   - 推荐 scope：`openid profile email offline_access`（可按需增减）。

2) 准备 PKCE 参数  
   - `code_verifier`：高熵随机字符串（最长 128 字符）。  
   - `code_challenge`：`base64url( SHA256(code_verifier) )`。  
   - `state`：随机字符串，用于防止 CSRF，回调时需原样比对。

3) 发起授权  
   构造并跳转到授权 URL：  
   ```
   GET https://api.dreamreflex.com/oauth/authorize?
     response_type=code&
     client_id=<your_client_id>&
     redirect_uri=<your_registered_redirect_uri>&
     scope=openid%20profile%20email%20offline_access&
     state=<random_state>&
     code_challenge=<code_challenge>&
     code_challenge_method=S256
   ```
   用户同意后，浏览器会重定向回你的 `redirect_uri`，携带 `code` 与 `state`。

4) 处理回调  
   - 校验回传的 `state` 与本地保存的一致。  
   - 取出 `code`，连同 `code_verifier` 用于下一步换取令牌。

5) 兑换令牌  
   ```
   POST https://api.dreamreflex.com/oauth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&
   code=<code_from_callback>&
   redirect_uri=<same_redirect_uri>&
   client_id=<your_client_id>&
   code_verifier=<your_code_verifier>
   ```
   成功响应示例：  
   ```json
   {
     "access_token": "...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "...",
     "scope": "openid profile email offline_access",
     "id_token": "..."   // 当 scope 包含 openid 时返回
   }
   ```
   刷新令牌请求示例：  
   ```
   grant_type=refresh_token&
   refresh_token=<your_refresh_token>&
   client_id=<your_client_id>
   ```

6) 获取用户信息  
   ```
   GET https://api.dreamreflex.com/oauth/userinfo
   Authorization: Bearer <access_token>
   ```
   响应包含用户标识、邮箱、角色等声明（字段以实际返回为准）。

### 安全建议
- 始终使用 `code_challenge_method=S256` 并校验 `state`。  
- `redirect_uri` 必须与平台注册的完全一致（协议、域名、路径、尾斜杠需匹配）。  
- 在浏览器场景将 `code_verifier` 和 `state` 保存在内存或 `sessionStorage`，避免被其他标签页复用。  
- 全程使用 HTTPS，令牌仅通过 `Authorization: Bearer` 头传输，不放在 URL。

### 快速联调清单
1. 客户端已在平台创建并记录 `client_id`，回调地址已登记。  
2. 本地生成 `code_verifier`、`code_challenge(S256)`、`state`。  
3. 浏览器跳转授权端点 → 回调收到 `code`/`state` → 校验 `state`。  
4. 使用 `code + code_verifier` 调用令牌端点，获取 Access Token（可选 Refresh Token/ID Token）。  
5. 用 Access Token 访问受保护 API；如需长登录，使用 Refresh Token 续期。
