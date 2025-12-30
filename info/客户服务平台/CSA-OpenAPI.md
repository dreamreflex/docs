---
sidebar_position: 1
---
# CSA - OpenAPI

**版本**: v2.1.0  
**基础URL**: `https://api.dreamreflex.com/api`  
**协议**: HTTP/HTTPS  
**数据格式**: JSON  
**目标用户**: 客户及二次开发者

---

## 目录

1. [概述](#概述)
2. [认证方式](#认证方式)
3. [通用规范](#通用规范)
4. [接口列表](#接口列表)
5. [数据模型](#数据模型)
6. [错误码说明](#错误码说明)
7. [完整流程示例](#完整流程示例)
8. [前端实现建议](#前端实现建议)

---

## 概述

这是云梦镜像客户服务系统（Customer Service Application - CSA）的API文档，面向客户和二次开发者。本API提供完整的客户服务功能，包括用户认证、工单管理、业务账号管理、合同查看、项目查看等功能。

### 功能模块

- **用户认证**:
  - 邮箱+密码认证: 注册、登录、获取用户信息、更新个人资料、修改密码
  - SMS短信认证: 短信验证码登录、手机号绑定、短信重置密码
  - Passkey通行密钥: 注册、管理、认证通行密钥
  - OAuth2/OIDC: 第三方应用授权、标准协议支持
  - API密钥: 应用级别的API访问密钥管理
- **工单管理**: 创建、查询、更新、删除工单（仅限自己的工单）
- **业务账号管理**: 申请、查看、更新业务账号信息
- **合同管理**: 查看自己的合同列表和详情，更新合同的签署状态
- **项目管理**: 查看自己的项目、文件、链接和任务
- **文件管理**: 文件上传、下载、预签名URL生成
- **联系我们**: 提交联系表单

### 技术特点

- RESTful API设计
- 多重认证方式：JWT Token、SMS短信、Passkey、OAuth2/OIDC、API密钥
- 完整的错误处理
- 分页查询支持
- 文件上传和云存储集成
- WebAuthn Passkey支持
- 短信验证码集成
- Cloudflare Turnstile人机验证

### 权限说明

- **普通用户**: 可以管理自己的工单、业务账号、查看和管理自己的合同和项目
- **数据隔离**: 用户只能访问自己创建或拥有的资源
- **管理员功能**: 管理员专用接口不在本文档中，如需管理员功能请联系技术支持

---

## 认证方式

### Token类型

使用 **Bearer Token** 方式进行身份认证。

### 如何获取Token

通过登录接口获取Token：

```http
POST /api/auth/login
```

### 如何使用Token

在所有需要认证的接口中，添加以下请求头：

```
Authorization: Bearer <your_access_token>
```

### Token有效期

- 访问令牌（Access Token）: 30分钟
- Token过期后需要重新登录
- 建议在Token即将过期前提示用户重新登录

---

## 通用规范

### HTTP方法

- `GET` - 获取资源
- `POST` - 创建资源
- `PUT` - 更新资源
- `PATCH` - 部分更新资源
- `DELETE` - 删除资源

### 请求头

**必需的请求头**：

```
Content-Type: application/json
```

**需要认证的接口额外添加**：

```
Authorization: Bearer <token>
```

### 响应格式

#### 成功响应

所有成功的响应都包含实际的数据对象。

**示例**：
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user"
}
```

#### 错误响应

所有错误响应遵循统一格式：

```json
{
  "detail": "错误描述信息"
}
```

### 状态码

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | 成功 | GET、PUT、PATCH请求成功 |
| 201 | 已创建 | POST创建资源成功 |
| 204 | 无内容 | DELETE删除成功 |
| 400 | 请求错误 | 参数验证失败或业务逻辑错误 |
| 401 | 未授权 | 未提供Token或Token无效 |
| 403 | 禁止访问 | 权限不足（如访问他人的资源） |
| 404 | 未找到 | 资源不存在 |
| 422 | 参数验证失败 | 请求数据格式错误 |
| 500 | 服务器错误 | 服务器内部错误 |

### 分页规范

所有列表接口支持分页，使用以下查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数（用于分页） |
| limit | integer | 否 | 10 | 返回的记录数（最大100） |

**分页计算示例**：
```javascript
// 获取第2页（每页10条）
const page = 2;
const pageSize = 10;
const skip = (page - 1) * pageSize;  // skip = 10
const limit = pageSize;              // limit = 10

// 计算总页数
const totalPages = Math.ceil(total / limit);
```

---

## 接口列表

### 1. 认证模块

#### 1.1 基础认证（邮箱+密码）

#### 1.1 发送邮箱验证码

**接口说明**: 向指定邮箱发送6位数字验证码，用于注册。

**接口地址**: `POST /api/auth/send-code`

**是否需要认证**: 否

**请求参数**:

```json
{
  "email": "string"  // 必填，邮箱地址，需符合邮箱格式
}
```

**请求示例**:

```http
POST /api/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**成功响应**: `200 OK`

```json
{
  "message": "验证码已发送",
  "email": "user@example.com"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 422 | 邮箱格式不正确 |
| 500 | 邮件发送失败 |

**注意事项**:

- 验证码有效期为10分钟
- 同一邮箱建议限制发送频率（前端控制，如60秒内只能发送一次）
- 开发环境下验证码会输出到服务器日志

---

#### 1.2 用户注册

**接口说明**: 使用邮箱和验证码注册新用户。

**接口地址**: `POST /api/auth/register`

**是否需要认证**: 否

**请求参数**:

```json
{
  "email": "string",              // 必填，邮箱地址
  "password": "string",           // 必填，密码（8-128位）
  "verification_code": "string"   // 必填，6位数字验证码
}
```

**参数限制**:

- `email`: 必须是有效的邮箱格式
- `password`: 长度8-128位，支持字母、数字、特殊字符
- `verification_code`: 必须是6位数字

**请求示例**:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword123",
  "verification_code": "123456"
}
```

**成功响应**: `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": null,
  "full_name": null,
  "phone_number": null,
  "avatar_url": null,
  "bio": null
}
```

**错误响应**:

| 状态码 | 说明 | detail |
|--------|------|--------|
| 400 | 验证码无效 | "验证码无效或已过期" |
| 400 | 邮箱已注册 | "该邮箱已被注册" |
| 422 | 参数验证失败 | "密码长度至少为8位" 等 |

**注意事项**:

- 注册后默认角色为 `user`（普通用户）
- 账号默认为激活状态
- 密码会经过安全加密存储（Argon2）

---

#### 1.3 用户登录（JSON格式）

**接口说明**: 使用邮箱和密码登录，获取访问令牌。

**接口地址**: `POST /api/auth/login`

**是否需要认证**: 否

**请求参数**:

```json
{
  "email": "string",     // 必填，邮箱地址
  "password": "string"   // 必填，密码
}
```

**请求示例**:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**成功响应**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**响应字段说明**:

- `access_token`: 访问令牌，用于后续API调用
- `token_type`: 令牌类型，固定为 "bearer"
- `expires_in`: 令牌有效期（秒），默认1800秒（30分钟）

**错误响应**:

| 状态码 | 说明 | detail |
|--------|------|--------|
| 401 | 登录失败 | "邮箱或密码错误" |
| 403 | 账号被禁用 | "账号已被禁用" |

**注意事项**:

- Token应该安全存储在前端（localStorage或sessionStorage）
- Token过期后需要重新登录
- 建议在Token即将过期前提示用户

---

#### 1.4 用户登录（OAuth2标准）

**接口说明**: OAuth2标准登录接口，用于工具集成。

**接口地址**: `POST /api/auth/token`

**是否需要认证**: 否

**请求格式**: `application/x-www-form-urlencoded`

**请求参数**:

```
username=user@example.com&password=mypassword123
```

**注意**: 虽然参数名是 `username`，但请填写邮箱地址。

**成功响应**: 同 `/api/auth/login`

**使用场景**: 主要用于Swagger UI认证，前端建议使用 `/api/auth/login`

---

#### 1.5 获取当前用户信息

**接口说明**: 获取当前登录用户的详细信息。

**接口地址**: `GET /api/auth/me` 或 `GET /api/users/me`

**是否需要认证**: 是

**请求示例**:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-02-01T12:34:56Z",
  "full_name": "张三",
  "phone_number": "+86-13800000000",
  "avatar_url": "https://cdn.example.com/avatar.png",
  "bio": "负责北区客户成功支持。"
}
```

**响应字段说明**:

- `id`: 用户唯一标识
- `email`: 用户邮箱
- `role`: 用户角色（"user" 或 "admin"）
- `is_active`: 账号是否激活
- `created_at`: 账号创建时间（ISO 8601格式，UTC）
- `updated_at`: 账号最近更新时间（可能为 `null`）
- `full_name`: 用户姓名（可选）
- `phone_number`: 联系方式（可选）
- `avatar_url`: 头像URL（可选）
- `bio`: 个人简介（可选）

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | Token无效或已过期 |
| 403 | 账号已被禁用 |

---

#### 1.6 更新当前用户资料

**接口说明**: 修改当前登录用户的基础资料（姓名、联系方式、头像、个人简介）。

**接口地址**: `PATCH /api/users/me`

**是否需要认证**: 是

**请求示例**:

```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "张三",
  "phone_number": "+86-13800000000",
  "bio": "负责北区客户成功支持。"
}
```

**请求字段说明**（全部可选，至少提供一个字段）:

| 字段 | 类型 | 说明 |
|------|------|------|
| `full_name` | string | 用户姓名，最长64字符 |
| `phone_number` | string | 联系方式，最长32字符 |
| `avatar_url` | string | 头像URL |
| `bio` | string | 个人简介，最长256字符 |

**成功响应**: `200 OK`，返回更新后的 `User` 对象（同 `GET /api/auth/me`）

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 未提供任何需要更新的字段 |
| 401 | 用户未登录或Token无效 |

---

#### 1.7 修改当前用户密码

**接口说明**: 用户自助修改登录密码。

**接口地址**: `POST /api/users/me/change-password`

**是否需要认证**: 是

**请求示例**:

```http
POST /api/users/me/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "OldPassw0rd!",
  "new_password": "NewPassw0rd!"
}
```

**请求字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `old_password` | string | 当前密码（必填） |
| `new_password` | string | 新密码（必填，8-128字符） |

**成功响应**: `200 OK`

```json
{
  "message": "密码修改成功"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 当前密码不正确或与新密码相同 |
| 401 | 用户未登录或Token无效 |

---

#### 1.2 SMS短信认证

##### 1.2.1 发送短信验证码

**接口说明**: 向指定手机号发送6位数字验证码，用于短信登录或绑定手机号。

**接口地址**: `POST /api/auth/send-sms-code`

**是否需要认证**: 否

**请求参数**:

```json
{
  "phone_number": "string"  // 必填，11位手机号
}
```

**请求示例**:

```http
POST /api/auth/send-sms-code
Content-Type: application/json

{
  "phone_number": "13800000000"
}
```

**成功响应**: `200 OK`

```json
{
  "message": "短信验证码已发送",
  "phone_number": "13800000000"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 422 | 手机号格式不正确 |
| 429 | 发送过于频繁，请稍后再试 |
| 500 | 短信发送失败 |

**注意事项**:

- 验证码有效期为10分钟
- 同一手机号60秒内只能发送一次
- 开发环境下验证码会输出到服务器日志

---

##### 1.2.2 短信登录

**接口说明**: 使用手机号和短信验证码进行登录。

**接口地址**: `POST /api/auth/login-by-sms`

**是否需要认证**: 否

**请求参数**:

```json
{
  "phone_number": "string",     // 必填，11位手机号
  "verification_code": "string" // 必填，6位数字验证码
}
```

**请求示例**:

```http
POST /api/auth/login-by-sms
Content-Type: application/json

{
  "phone_number": "13800000000",
  "verification_code": "123456"
}
```

**成功响应**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user13800000000@dreamreflex.com",
    "role": "user",
    "is_active": true,
    "full_name": null,
    "phone_number": "13800000000",
    "avatar_url": null,
    "bio": null
  }
}
```

**错误响应**:

| 状态码 | 说明 | detail |
|--------|------|--------|
| 400 | 验证码无效 | "短信验证码无效或已过期" |
| 403 | 账号被禁用 | "账号已被禁用" |

**注意事项**:

- 如果手机号未注册系统会自动创建新用户
- 新用户默认使用 `手机号@dreamreflex.com` 格式的邮箱
- Token有效期为30分钟

---

##### 1.2.3 绑定手机号

**接口说明**: 为当前登录用户绑定手机号。

**接口地址**: `POST /api/auth/bind-phone`

**是否需要认证**: 是

**请求参数**:

```json
{
  "phone_number": "string",     // 必填，11位手机号
  "verification_code": "string" // 必填，6位数字验证码
}
```

**请求示例**:

```http
POST /api/auth/bind-phone
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "13800000000",
  "verification_code": "123456"
}
```

**成功响应**: `200 OK`

```json
{
  "message": "手机号绑定成功",
  "phone_number": "13800000000"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 验证码无效或手机号已被其他用户使用 |
| 401 | 用户未登录 |

---

##### 1.2.4 修改手机号

**接口说明**: 修改当前用户的手机号。

**接口地址**: `POST /api/auth/change-phone`

**是否需要认证**: 是

**请求参数**:

```json
{
  "new_phone_number": "string",     // 必填，新手机号（11位）
  "verification_code": "string"     // 必填，新手机号的验证码（6位）
}
```

**成功响应**: `200 OK`

```json
{
  "message": "手机号码修改成功",
  "phone_number": "13800000000"
}
```

---

##### 1.2.5 短信重置密码

**接口说明**: 通过短信验证码重置登录密码。

**接口地址**: `POST /api/auth/reset-password-by-sms`

**是否需要认证**: 否

**请求参数**:

```json
{
  "phone_number": "string",     // 必填，11位手机号
  "verification_code": "string", // 必填，6位数字验证码
  "new_password": "string"       // 必填，新密码（8-128字符）
}
```

**成功响应**: `200 OK`

```json
{
  "message": "密码重置成功"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 验证码无效 |
| 404 | 该手机号未注册 |

---

#### 1.3 Passkey通行密钥

##### 1.3.1 获取通行密钥注册选项

**接口说明**: 获取WebAuthn通行密钥注册选项，用于浏览器创建新的通行密钥。

**接口地址**: `GET /api/passkey/registration-options`

**是否需要认证**: 是

**成功响应**: `200 OK`

```json
{
  "challenge": "base64-encoded-challenge",
  "rp": {
    "name": "DreamReflex",
    "id": "dreamreflex.com"
  },
  "user": {
    "id": "base64-encoded-user-id",
    "name": "user@example.com",
    "displayName": "user@example.com"
  },
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7
    }
  ],
  "timeout": 60000,
  "excludeCredentials": [],
  "authenticatorSelection": {
    "authenticatorAttachment": "cross-platform",
    "requireResidentKey": false,
    "userVerification": "preferred"
  }
}
```

---

##### 1.3.2 注册通行密钥

**接口说明**: 注册新的通行密钥。

**接口地址**: `POST /api/passkey/register`

**是否需要认证**: 是

**请求参数**:

```json
{
  "nickname": "string"  // 可选，通行密钥昵称
  // ... WebAuthn凭证数据
}
```

**成功响应**: `200 OK`

```json
{
  "message": "通行密钥注册成功",
  "credential": {
    "id": "credential-uuid",
    "credential_id": "base64-encoded-id",
    "nickname": "我的YubiKey",
    "is_primary": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

##### 1.3.3 获取通行密钥认证选项

**接口说明**: 获取通行密钥认证选项，用于通行密钥登录。

**接口地址**: `GET /api/passkey/authentication-options`

**是否需要认证**: 否

**成功响应**: `200 OK`

```json
{
  "challenge": "base64-encoded-challenge",
  "timeout": 60000,
  "rpId": "dreamreflex.com",
  "allowCredentials": [],
  "userVerification": "preferred"
}
```

---

##### 1.3.4 通行密钥认证

**接口说明**: 使用通行密钥进行身份认证。

**接口地址**: `POST /api/passkey/authenticate`

**是否需要认证**: 否

**请求参数**:

```json
{
  "credential_id": "string",        // 凭证ID
  "authenticator_data": "string",   // 认证器数据
  "client_data_json": "string",     // 客户端数据JSON
  "signature": "string"             // 签名
}
```

**成功响应**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 600,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user",
    "is_active": true
  }
}
```

---

##### 1.3.5 获取我的通行密钥列表

**接口说明**: 获取当前用户的所有通行密钥。

**接口地址**: `GET /api/passkey/credentials`

**是否需要认证**: 是

**成功响应**: `200 OK`

```json
[
  {
    "id": "credential-uuid",
    "credential_id": "base64-encoded-id",
    "nickname": "我的YubiKey",
    "is_primary": true,
    "sign_count": 5,
    "last_used_at": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

##### 1.3.6 更新通行密钥昵称

**接口地址**: `PUT /api/passkey/credentials/{credential_id}/nickname`

**是否需要认证**: 是

**请求参数**:

```json
{
  "nickname": "新昵称"
}
```

---

##### 1.3.7 设置主通行密钥

**接口地址**: `PUT /api/passkey/credentials/{credential_id}/primary`

**是否需要认证**: 是

---

##### 1.3.8 删除通行密钥

**接口地址**: `DELETE /api/passkey/credentials/{credential_id}`

**是否需要认证**: 是

---

##### 1.3.9 启用/禁用通行密钥登录

**接口地址**: `PUT /api/passkey/toggle`

**是否需要认证**: 是

**请求参数**:

```json
{
  "enabled": true
}
```

---

#### 1.4 OAuth2/OIDC认证

##### 1.4.1 OAuth2授权端点

**接口地址**: `GET /oauth/authorize`

**是否需要认证**: 否（需要用户登录）

**参数**:
- `response_type`: 响应类型（code）
- `client_id`: 客户端ID
- `redirect_uri`: 重定向URI
- `scope`: 请求的权限范围
- `state`: 状态参数

---

##### 1.4.2 OAuth2令牌端点

**接口地址**: `POST /oauth/token`

**是否需要认证**: 否

**支持的授权类型**:
- `authorization_code`: 授权码流程
- `refresh_token`: 刷新令牌
- `client_credentials`: 客户端凭据

---

##### 1.4.3 OIDC UserInfo端点

**接口地址**: `GET /oauth/userinfo`

**是否需要认证**: Bearer Token

---

##### 1.4.4 OIDC Discovery

**接口地址**: `GET /.well-known/openid-configuration`

---

#### 1.5 API密钥管理

##### 1.5.1 创建应用密钥

**接口地址**: `POST /api/application-key/create`

**是否需要认证**: 是

**成功响应**: `200 OK`

```json
{
  "message": "应用密钥创建成功",
  "application_key": {
    "id": "key-uuid",
    "key": "sk-1234567890abcdef",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

##### 1.5.2 获取应用密钥信息

**接口地址**: `GET /api/application-key/info`

**是否需要认证**: 是

---

##### 1.5.3 轮转应用密钥

**接口地址**: `POST /api/application-key/rotate`

**是否需要认证**: 是

---

##### 1.5.4 启用/禁用应用密钥

**接口地址**: `PUT /api/application-key/status`

**是否需要认证**: 是

**请求参数**:

```json
{
  "is_active": true
}
```

---

##### 1.5.5 验证应用密钥

**接口地址**: `GET /api/application-key/validate`

**是否需要认证**: 否

**查询参数**:
- `key`: 应用密钥

---

### 2. 工单模块

#### 2.1 创建工单

**接口说明**: 创建新的工单。

**接口地址**: `POST /api/tickets`

**是否需要认证**: 是

**权限要求**: 所有登录用户

**请求参数**:

```json
{
  "title": "string",        // 必填，工单标题（1-200字符）
  "ticket_type": "string",  // 必填，工单类型
  "content": "string"       // 必填，工单内容（至少1字符）
}
```

**工单类型** (`ticket_type`):

| 值 | 说明 |
|----|------|
| `financial` | 财务问题工单 |
| `technical` | 技术问题工单 |
| `business` | 业务问题工单 |

**请求示例**:

```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "无法导出财务报表",
  "ticket_type": "financial",
  "content": "在尝试导出本月财务报表时，系统提示"导出失败"，请帮忙处理。"
}
```

**成功响应**: `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "无法导出财务报表",
  "ticket_type": "financial",
  "content": "在尝试导出本月财务报表时，系统提示"导出失败"，请帮忙处理。",
  "status": "pending",
  "feedback": null,
  "creator_email": "user@example.com",
  "responder_email": null,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": null,
  "replied_at": null
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录或Token无效 |
| 422 | 参数验证失败（如标题过长、类型错误等） |

---

#### 2.2 获取工单列表

**接口说明**: 获取工单列表，支持分页和筛选。**普通用户只能看到自己创建的工单**。

**接口地址**: `GET /api/tickets`

**是否需要认证**: 是

**权限说明**:
- 普通用户：只能看到自己创建的工单
- 支持分页和状态过滤

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数（用于分页） |
| limit | integer | 否 | 10 | 返回的记录数（最大100） |
| status_filter | string | 否 | - | 按状态筛选 |

**状态筛选** (`status_filter`):

| 值 | 说明 |
|----|------|
| `pending` | 仅显示待回复的工单 |
| `replied` | 仅显示已回复的工单 |
| 不传 | 显示所有状态 |

**请求示例**:

```http
GET /api/tickets?skip=0&limit=10&status_filter=pending
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 25,
  "items": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "无法导出财务报表",
      "ticket_type": "financial",
      "content": "在尝试导出本月财务报表时...",
      "status": "pending",
      "feedback": null,
      "creator_email": "user@example.com",
      "responder_email": null,
      "created_at": "2024-01-01T10:00:00",
      "updated_at": null,
      "replied_at": null
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "系统登录缓慢",
      "ticket_type": "technical",
      "content": "最近几天登录系统非常慢...",
      "status": "replied",
      "feedback": "已优化服务器性能，请重试。",
      "creator_email": "user@example.com",
      "responder_email": "admin@example.com",
      "created_at": "2024-01-01T09:00:00",
      "updated_at": "2024-01-01T12:00:00",
      "replied_at": "2024-01-01T12:00:00"
    }
  ]
}
```

**响应字段说明**:

- `total`: 符合条件的工单总数
- `items`: 当前页的工单列表

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 422 | 参数验证失败（如limit超过100） |

---

#### 2.3 获取工单详情

**接口说明**: 获取指定工单的详细信息。**普通用户只能查看自己的工单**。

**接口地址**: `GET /api/tickets/{ticket_id}`

**是否需要认证**: 是

**权限说明**:
- 普通用户：只能查看自己的工单

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| ticket_id | string | 工单ID |

**请求示例**:

```http
GET /api/tickets/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "无法导出财务报表",
  "ticket_type": "financial",
  "content": "在尝试导出本月财务报表时，系统提示"导出失败"，请帮忙处理。",
  "status": "pending",
  "feedback": null,
  "creator_email": "user@example.com",
  "responder_email": null,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": null,
  "replied_at": null
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此工单（不是创建者） |
| 404 | 工单不存在 |

---

#### 2.4 更新工单

**接口说明**: 更新工单的标题和内容。**只能更新自己创建的、状态为 `pending`（待回复）的工单**。

**接口地址**: `PUT /api/tickets/{ticket_id}`

**是否需要认证**: 是

**权限要求**:
- 只能更新自己创建的工单
- 只能更新状态为 `pending`（待回复）的工单
- 已回复的工单不能再更新

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| ticket_id | string | 工单ID |

**请求参数**:

```json
{
  "title": "string",   // 可选，工单标题（1-200字符）
  "content": "string"  // 可选，工单内容（至少1字符）
}
```

**注意**: 至少提供一个字段，可以只更新标题或只更新内容。

**请求示例**:

```http
PUT /api/tickets/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "无法导出财务报表（已重试）",
  "content": "在尝试导出本月财务报表时，系统提示"导出失败"。我已经重试了多次，问题依然存在。"
}
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "无法导出财务报表（已重试）",
  "ticket_type": "financial",
  "content": "在尝试导出本月财务报表时，系统提示"导出失败"。我已经重试了多次，问题依然存在。",
  "status": "pending",
  "feedback": null,
  "creator_email": "user@example.com",
  "responder_email": null,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:30:00",
  "replied_at": null
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 工单已被回复，不能再更新 |
| 401 | 未登录 |
| 403 | 无权更新此工单（不是创建者） |
| 404 | 工单不存在 |
| 422 | 参数验证失败 |

---

#### 2.5 删除工单

**接口说明**: 删除指定的工单。**只能删除自己创建的工单**。

**接口地址**: `DELETE /api/tickets/{ticket_id}`

**是否需要认证**: 是

**权限说明**:
- 普通用户：可以删除自己创建的工单

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| ticket_id | string | 工单ID |

**请求示例**:

```http
DELETE /api/tickets/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**成功响应**: `204 No Content`

（无响应体）

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权删除此工单 |
| 404 | 工单不存在 |

---

### 3. 业务账号模块

#### 3.1 获取当前用户的业务账号

**接口说明**: 获取当前登录用户的业务账号信息。

**接口地址**: `GET /api/business-accounts/me`

**是否需要认证**: 是

**请求示例**:

```http
GET /api/business-accounts/me
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439020",
  "owner_email": "user@example.com",
  "status": "active",
  "assigned_email": "user@company.com",
  "user_code": "USER001",
  "company_name": "示例公司",
  "tax_number": "91110000MA01234567",
  "certification_info": "营业执照等认证信息",
  "communication_address": "北京市朝阳区xxx",
  "contact_person_name": "张三",
  "contact_phone": "+86-13800000000",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**业务账号状态** (`status`):

| 值 | 说明 |
|----|------|
| `pending` | 待审核（已申请，等待管理员审核） |
| `active` | 已激活（已分配专属邮箱，可以正常使用） |
| `disabled` | 已禁用 |

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 404 | 业务账号不存在（未申请或未创建） |

---

#### 3.2 申请创建业务账号

**接口说明**: 申请创建业务账号。如果当前用户尚无业务账号，则创建一条 `pending` 状态的记录。

**接口地址**: `POST /api/business-accounts/me/apply`

**是否需要认证**: 是

**请求参数**:

```json
{
  "company_name": "string",              // 可选，公司抬头（最长128字符）
  "tax_number": "string",                 // 可选，税号（最长64字符）
  "certification_info": "string",        // 可选，认证信息（最长512字符）
  "communication_address": "string",     // 可选，通信地址（最长256字符）
  "contact_person_name": "string",       // 可选，联系人姓名（最长64字符）
  "contact_phone": "string"              // 可选，联系方式（最长32字符）
}
```

**注意**: 所有字段都是可选的，但建议尽可能填写完整信息以便审核。

**请求示例**:

```http
POST /api/business-accounts/me/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "company_name": "示例公司",
  "tax_number": "91110000MA01234567",
  "certification_info": "营业执照等认证信息",
  "communication_address": "北京市朝阳区xxx",
  "contact_person_name": "张三",
  "contact_phone": "+86-13800000000"
}
```

**成功响应**: `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439020",
  "owner_email": "user@example.com",
  "status": "pending",
  "assigned_email": null,
  "user_code": null,
  "company_name": "示例公司",
  "tax_number": "91110000MA01234567",
  "certification_info": "营业执照等认证信息",
  "communication_address": "北京市朝阳区xxx",
  "contact_person_name": "张三",
  "contact_phone": "+86-13800000000",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": null
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 已存在申请或已激活账号 |
| 401 | 未登录 |
| 422 | 参数验证失败 |

---

#### 3.3 更新当前用户的业务账号资料

**接口说明**: 更新当前登录用户业务账号中可编辑字段。

**接口地址**: `PATCH /api/business-accounts/me`

**是否需要认证**: 是

**可编辑字段**:
- 公司抬头
- 税号
- 认证信息
- 通信地址
- 联系人姓名
- 联系方式

**注意**: 专属邮箱（`assigned_email`）和用户识别码（`user_code`）由管理员分配，用户无法修改。

**请求参数**:

```json
{
  "company_name": "string",              // 可选，公司抬头
  "tax_number": "string",                 // 可选，税号
  "certification_info": "string",        // 可选，认证信息
  "communication_address": "string",     // 可选，通信地址
  "contact_person_name": "string",       // 可选，联系人姓名
  "contact_phone": "string"              // 可选，联系方式
}
```

**请求示例**:

```http
PATCH /api/business-accounts/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "company_name": "更新后的公司名称",
  "contact_phone": "+86-13900000000"
}
```

**成功响应**: `200 OK`，返回更新后的业务账号对象

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 404 | 业务账号不存在 |
| 422 | 参数验证失败 |

---

#### 3.4 获取业务账号详情

**接口说明**: 获取业务账号详情。**普通用户只能查看自己的业务账号**。

**接口地址**: `GET /api/business-accounts/{account_id}`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己的业务账号

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| account_id | string | 业务账号ID |

**请求示例**:

```http
GET /api/business-accounts/507f1f77bcf86cd799439020
Authorization: Bearer <token>
```

**成功响应**: `200 OK`，返回业务账号对象（同 `GET /api/business-accounts/me`）

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此业务账号 |
| 404 | 业务账号不存在 |

---

### 4. 合同模块

#### 4.1 获取我的合同列表

**接口说明**: 获取当前登录用户自己的合同列表。

**接口地址**: `GET /api/contracts/me`

**是否需要认证**: 是

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数（用于分页） |
| limit | integer | 否 | 10 | 返回的记录数（最大100） |

**请求示例**:

```http
GET /api/contracts/me?skip=0&limit=10
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 5,
  "items": [
    {
      "id": "507f1f77bcf86cd799439030",
      "owner_email": "user@example.com",
      "title": "云服务合同（2025版）",
      "content_markdown": "# 合同正文\n\n这里是 Markdown 格式的合同内容……",
      "is_signed": false,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ]
}
```

**响应字段说明**:

- `total`: 符合条件的合同总数
- `items`: 当前页的合同列表
- `is_signed`: 签署状态，`true` 表示已签署，`false` 表示待签署
- `content_markdown`: 合同内容为 Markdown 格式，前端需要渲染

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 422 | 参数验证失败 |

---

#### 4.2 获取合同详情

**接口说明**: 获取指定合同的详细信息。**普通用户只能查看自己的合同**。

**接口地址**: `GET /api/contracts/{contract_id}`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己的合同

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| contract_id | string | 合同ID |

**请求示例**:

```http
GET /api/contracts/507f1f77bcf86cd799439030
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439030",
  "owner_email": "user@example.com",
  "title": "云服务合同（2025版）",
  "content_markdown": "# 合同正文\n\n这里是 Markdown 格式的合同内容……",
  "is_signed": false,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此合同 |
| 404 | 合同不存在 |

---

#### 4.3 更新合同签署状态

**接口说明**: 更新指定合同的签署状态。**普通用户只能更新自己的合同**。

**接口地址**: `PATCH /api/contracts/{contract_id}/sign-status`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能更新自己的合同
- 管理员可以更新任意合同

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| contract_id | string | 合同ID |

**请求体**:

```json
{
  "is_signed": true
}
```

**请求体字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| is_signed | boolean | 是 | 签署状态，`true` 表示已签署，`false` 表示待签署 |

**请求示例**:

```http
PATCH /api/contracts/507f1f77bcf86cd799439030/sign-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_signed": true
}
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439030",
  "owner_email": "user@example.com",
  "title": "云服务合同（2025版）",
  "content_markdown": "# 合同正文\n\n这里是 Markdown 格式的合同内容……",
  "is_signed": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权更新此合同的签署状态 |
| 404 | 合同不存在 |
| 422 | 参数验证失败 |

**使用场景**:
- 用户完成合同签署后，更新签署状态为已签署
- 需要修改签署状态时，可以随时更新

---

### 5. 项目模块

#### 5.1 获取我的项目列表

**接口说明**: 获取当前登录用户自己的项目列表。

**接口地址**: `GET /api/projects/me`

**是否需要认证**: 是

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数（用于分页） |
| limit | integer | 否 | 10 | 返回的记录数（最大100） |

**请求示例**:

```http
GET /api/projects/me?skip=0&limit=10
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 3,
  "items": [
    {
      "id": "507f1f77bcf86cd799439040",
      "owner_email": "user@example.com",
      "name": "示例项目",
      "description": "这是一个示例项目",
      "overview_markdown": "# 项目概述\n\n这里是项目概述内容...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**响应字段说明**:

- `total`: 符合条件的项目总数
- `items`: 当前页的项目列表
- `overview_markdown`: 项目概述为 Markdown 格式，前端需要渲染

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 422 | 参数验证失败 |

---

#### 5.2 获取项目详情

**接口说明**: 获取指定项目的详细信息。**普通用户只能查看自己的项目**。

**接口地址**: `GET /api/projects/{project_id}`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己的项目

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目ID |

**请求示例**:

```http
GET /api/projects/507f1f77bcf86cd799439040
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439040",
  "owner_email": "user@example.com",
  "name": "示例项目",
  "description": "这是一个示例项目",
  "overview_markdown": "# 项目概述\n\n这里是项目概述内容...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此项目 |
| 404 | 项目不存在 |

---

#### 5.3 获取项目文件列表

**接口说明**: 获取项目文件列表，支持按文件名和标签筛选。**普通用户只能查看自己项目的文件**。

**接口地址**: `GET /api/projects/{project_id}/files`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己项目的文件

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目ID |

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数 |
| limit | integer | 否 | 100 | 返回的记录数（最大500） |
| filename | string | 否 | - | 按文件名筛选（模糊匹配） |
| tag | string | 否 | - | 按标签筛选（精确匹配） |

**请求示例**:

```http
GET /api/projects/507f1f77bcf86cd799439040/files?skip=0&limit=100&tag=文档
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 10,
  "items": [
    {
      "id": "507f1f77bcf86cd799439050",
      "project_id": "507f1f77bcf86cd799439040",
      "filename": "项目文档.pdf",
      "file_size": 1024000,
      "content_type": "application/pdf",
      "tag": "文档",
      "oss_key": "projects/507f1f77bcf86cd799439040/files/项目文档.pdf",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ]
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此项目 |
| 404 | 项目不存在 |

---

#### 5.4 获取文件下载预签名URL

**接口说明**: 获取文件下载预签名URL。客户端使用此URL直接下载文件，避免文件流量经过服务器。**普通用户只能下载自己项目的文件**。

**接口地址**: `POST /api/projects/files/{file_id}/download-url`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能下载自己项目的文件

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| file_id | string | 文件ID |

**请求示例**:

```http
POST /api/projects/files/507f1f77bcf86cd799439050/download-url
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "download_url": "https://oss.example.com/projects/...?signature=...",
  "expires_in": 3600
}
```

**响应字段说明**:

- `download_url`: 预签名下载URL，可直接用于下载文件
- `expires_in`: URL有效期（秒），通常为3600秒（1小时）

**使用示例**:

```javascript
// 获取下载URL
const response = await fetch('/api/projects/files/507f1f77bcf86cd799439050/download-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { download_url } = await response.json();

// 直接使用URL下载文件
window.open(download_url);
// 或使用 fetch 下载
const fileResponse = await fetch(download_url);
const blob = await fileResponse.blob();
// 处理文件...
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此文件 |
| 404 | 文件不存在 |

---

#### 5.5 获取项目链接列表

**接口说明**: 获取项目链接列表。**普通用户只能查看自己项目的链接**。

**接口地址**: `GET /api/projects/{project_id}/links`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己项目的链接

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目ID |

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数 |
| limit | integer | 否 | 100 | 返回的记录数（最大500） |

**请求示例**:

```http
GET /api/projects/507f1f77bcf86cd799439040/links?skip=0&limit=100
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 5,
  "items": [
    {
      "id": "507f1f77bcf86cd799439060",
      "project_id": "507f1f77bcf86cd799439040",
      "title": "项目文档链接",
      "url": "https://docs.example.com/project",
      "description": "项目相关文档",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ]
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此项目 |
| 404 | 项目不存在 |

---

#### 5.6 获取项目任务列表

**接口说明**: 获取项目任务列表，支持按状态筛选。**普通用户只能查看自己项目的任务**。

**接口地址**: `GET /api/projects/{project_id}/tasks`

**是否需要认证**: 是

**权限说明**:
- 普通用户只能查看自己项目的任务

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目ID |

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数 |
| limit | integer | 否 | 100 | 返回的记录数（最大500） |
| status | string | 否 | - | 按状态筛选（pending=未完成, completed=已完成） |

**请求示例**:

```http
GET /api/projects/507f1f77bcf86cd799439040/tasks?skip=0&limit=100&status=pending
Authorization: Bearer <token>
```

**成功响应**: `200 OK`

```json
{
  "total": 8,
  "items": [
    {
      "id": "507f1f77bcf86cd799439070",
      "project_id": "507f1f77bcf86cd799439040",
      "title": "完成项目文档",
      "description": "编写项目相关文档",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ]
}
```

**任务状态** (`status`):

| 值 | 说明 |
|----|------|
| `pending` | 未完成 |
| `completed` | 已完成 |

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 403 | 无权访问此项目 |
| 404 | 项目不存在 |

---

### 6. 文件上传模块

#### 6.1 文件上传

**接口说明**: 上传文件到云存储。支持多种文件类型，文件大小限制为100MB。

**接口地址**: `POST /api/upload`

**是否需要认证**: 是

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 要上传的文件 |
| tag | string | 否 | 文件标签/分类 |

**请求示例**:

```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary file data>
tag: "文档"
```

**成功响应**: `201 Created`

```json
{
  "id": "file-uuid",
  "filename": "document.pdf",
  "file_size": 1024000,
  "content_type": "application/pdf",
  "tag": "文档",
  "oss_key": "uploads/2024/01/document.pdf",
  "download_url": "https://oss.example.com/uploads/2024/01/document.pdf?signature=...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | 文件大小超过限制或文件类型不支持 |
| 401 | 未登录 |
| 413 | 文件过大 |

**支持的文件类型**:
- 文档: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- 图片: JPG, PNG, GIF, WebP
- 压缩包: ZIP, RAR, 7Z
- 其他: TXT, CSV, JSON等

---

#### 6.2 获取文件下载URL

**接口说明**: 获取文件的预签名下载URL。

**接口地址**: `POST /api/files/{file_id}/download-url`

**是否需要认证**: 是

**成功响应**: `200 OK`

```json
{
  "download_url": "https://oss.example.com/...",
  "expires_in": 3600
}
```

---

### 7. 联系我们模块

#### 6.1 提交联系表单

**接口说明**: 提交联系我们表单（公开接口，需要 Cloudflare Turnstile 验证）。

**接口地址**: `POST /api/owa/info`

**是否需要认证**: 否

**请求参数**:

```json
{
  "name": "string",              // 必填，称呼
  "email": "string",              // 必填，邮箱（不进行格式校验，允许任意字符串）
  "message": "string",            // 必填，消息内容
  "turnstileToken": "string"     // 必填，Cloudflare Turnstile 验证令牌
}
```

**请求示例**:

```http
POST /api/owa/info
Content-Type: application/json

{
  "name": "张三",
  "email": "user@example.com",
  "message": "我想咨询一下产品价格",
  "turnstileToken": "0.xxx..."
}
```

**成功响应**: `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439080",
  "name": "张三",
  "email": "user@example.com",
  "message": "我想咨询一下产品价格",
  "is_processed": false,
  "admin_notes": null,
  "created_at": "2024-01-01T10:00:00"
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| 400 | Turnstile验证失败 |
| 422 | 参数验证失败 |

**注意事项**:

- 提交后会自动发送通知邮件给管理员
- 需要在前端集成 Cloudflare Turnstile 进行人机验证
- 验证令牌有效期为几分钟，请及时提交

---

## 数据模型

### User（用户）

```typescript
{
  id: string;              // 用户唯一标识
  email: string;           // 邮箱地址
  role: "user" | "admin";  // 用户角色
  is_active: boolean;      // 账号是否激活
  created_at: string;      // 创建时间（ISO 8601，UTC）
  updated_at: string | null;   // 最后更新时间，可能为 null
  full_name: string | null;    // 姓名
  phone_number: string | null; // 联系方式
  avatar_url: string | null;   // 头像链接
  bio: string | null;          // 个人简介
}
```

### Ticket（工单）

```typescript
{
  id: string;                              // 工单唯一标识
  title: string;                           // 工单标题
  ticket_type: "financial" | "technical" | "business";  // 工单类型
  content: string;                         // 工单内容
  status: "pending" | "replied";          // 工单状态
  feedback: string | null;                 // 反馈结果（管理员回复）
  creator_email: string;                   // 创建者邮箱
  responder_email: string | null;          // 回复者邮箱（管理员）
  created_at: string;                      // 创建时间（ISO 8601）
  updated_at: string | null;               // 更新时间（ISO 8601）
  replied_at: string | null;               // 回复时间（ISO 8601）
}
```

### BusinessAccount（业务账号）

```typescript
{
  id: string;                              // 业务账号唯一标识
  owner_email: string;                     // 所属用户邮箱
  status: "pending" | "active" | "disabled";  // 业务账号状态
  assigned_email: string | null;           // 专属邮箱（管理员分配）
  user_code: string | null;                 // 用户识别码（管理员分配）
  company_name: string | null;              // 公司抬头
  tax_number: string | null;                // 税号
  certification_info: string | null;       // 认证信息
  communication_address: string | null;    // 通信地址
  contact_person_name: string | null;      // 联系人姓名
  contact_phone: string | null;            // 联系方式
  created_at: string;                      // 创建时间（ISO 8601）
  updated_at: string | null;               // 更新时间（ISO 8601）
}
```

### Contract（合同）

```typescript
{
  id: string;                              // 合同唯一标识
  owner_email: string;                     // 所属用户邮箱
  title: string;                           // 合同标题
  content_markdown: string;                // 合同内容（Markdown格式）
  is_signed: boolean;                      // 签署状态，true表示已签署，false表示待签署
  created_at: string;                      // 创建时间（ISO 8601）
  updated_at: string | null;               // 更新时间（ISO 8601）
}
```

### Project（项目）

```typescript
{
  id: string;                              // 项目唯一标识
  owner_email: string;                     // 所属用户邮箱
  name: string;                            // 项目名称
  description: string | null;               // 项目描述
  overview_markdown: string;               // 项目概述（Markdown格式）
  created_at: string;                      // 创建时间（ISO 8601，UTC）
  updated_at: string | null;               // 更新时间（ISO 8601，UTC）
}
```

### ProjectFile（项目文件）

```typescript
{
  id: string;                              // 文件唯一标识
  project_id: string;                      // 所属项目ID
  filename: string;                        // 文件名
  file_size: number;                       // 文件大小（字节）
  content_type: string;                    // 文件MIME类型
  tag: string | null;                      // 文件标签
  oss_key: string;                         // OSS存储键
  created_at: string;                      // 创建时间（ISO 8601，UTC）
  updated_at: string | null;               // 更新时间（ISO 8601，UTC）
}
```

### ProjectLink（项目链接）

```typescript
{
  id: string;                              // 链接唯一标识
  project_id: string;                      // 所属项目ID
  title: string;                           // 链接标题
  url: string;                             // 链接URL
  description: string | null;              // 链接描述
  created_at: string;                      // 创建时间（ISO 8601，UTC）
  updated_at: string | null;               // 更新时间（ISO 8601，UTC）
}
```

### ProjectTask（项目任务）

```typescript
{
  id: string;                              // 任务唯一标识
  project_id: string;                      // 所属项目ID
  title: string;                           // 任务标题
  description: string | null;              // 任务描述
  status: "pending" | "completed";         // 任务状态
  created_at: string;                      // 创建时间（ISO 8601，UTC）
  updated_at: string | null;               // 更新时间（ISO 8601，UTC）
}
```

### Token（令牌）

```typescript
{
  access_token: string;    // 访问令牌
  token_type: "bearer";    // 令牌类型
  expires_in: number;      // 有效期（秒）
}
```

### SMSInfo（短信信息）

```typescript
{
  id: string;                    // 唯一标识
  user_id: string;              // 用户ID
  phone_number: string;         // 手机号
  is_verified: boolean;         // 是否已验证
  created_at: string;           // 创建时间
  updated_at: string | null;    // 更新时间
}
```

### SMSVerificationCode（短信验证码）

```typescript
{
  id: string;                    // 唯一标识
  phone_number: string;         // 手机号
  code: string;                 // 验证码
  expires_at: string;           // 过期时间
  created_at: string;           // 创建时间
}
```

### PasskeyCredential（通行密钥凭证）

```typescript
{
  id: string;                    // 唯一标识
  user_id: string;              // 用户ID
  credential_id: string;        // 凭证ID（base64）
  nickname: string | null;      // 昵称
  public_key: string;           // 公钥（base64）
  sign_count: number;           // 签名计数
  is_primary: boolean;          // 是否为主密钥
  last_used_at: string | null;  // 最后使用时间
  created_at: string;           // 创建时间
}
```

### OAuthClient（OAuth客户端）

```typescript
{
  id: string;                    // 唯一标识
  client_id: string;            // 客户端ID
  client_secret: string;        // 客户端密钥
  client_name: string;          // 客户端名称
  redirect_uris: string[];      // 重定向URI列表
  scopes: string[];             // 允许的权限范围
  grant_types: string[];        // 支持的授权类型
  response_types: string[];     // 支持的响应类型
  is_active: boolean;           // 是否激活
  created_at: string;           // 创建时间
}
```

### OAuthAuthorization（OAuth授权）

```typescript
{
  id: string;                    // 唯一标识
  client_id: string;            // 客户端ID
  user_id: string;              // 用户ID
  scope: string[];              // 授权的权限范围
  code: string;                 // 授权码
  redirect_uri: string;         // 重定向URI
  expires_at: string;           // 过期时间
  created_at: string;           // 创建时间
}
```

### OAuthToken（OAuth令牌）

```typescript
{
  id: string;                    // 唯一标识
  client_id: string;            // 客户端ID
  user_id: string | null;       // 用户ID
  scope: string[];              // 令牌权限范围
  access_token: string;         // 访问令牌
  refresh_token: string | null; // 刷新令牌
  expires_at: string;           // 过期时间
  token_type: string;           // 令牌类型
  created_at: string;           // 创建时间
}
```

### ApiKey（API密钥）

```typescript
{
  id: string;                    // 唯一标识
  user_id: string;              // 用户ID
  key: string;                  // API密钥
  is_active: boolean;           // 是否激活
  last_used_at: string | null;  // 最后使用时间
  created_at: string;           // 创建时间
  updated_at: string | null;    // 更新时间
}
```

### Contact（联系表单）

```typescript
{
  id: string;                    // 唯一标识
  name: string;                 // 称呼
  email: string;                // 邮箱
  message: string;              // 消息内容
  is_processed: boolean;        // 是否已处理
  admin_notes: string | null;   // 管理员备注
  created_at: string;           // 创建时间
  updated_at: string | null;    // 更新时间
}
```

### UploadedFile（上传文件）

```typescript
{
  id: string;                    // 唯一标识
  user_id: string;              // 上传用户ID
  filename: string;             // 文件名
  file_size: number;            // 文件大小（字节）
  content_type: string;         // 文件MIME类型
  tag: string | null;           // 文件标签
  oss_key: string;              // OSS存储键
  created_at: string;           // 创建时间
}
```

---

## 错误码说明

### 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### 常见错误

| 状态码 | 场景 | detail示例 | 前端处理建议 |
|--------|------|-----------|-------------|
| 400 | 业务逻辑错误 | "验证码无效或已过期" | 提示用户重新操作 |
| 401 | 未认证 | "无效的认证凭据" | 跳转到登录页 |
| 403 | 权限不足 | "无权访问此资源" | 提示权限不足 |
| 404 | 资源不存在 | "工单不存在" | 提示资源不存在 |
| 422 | 参数验证失败 | "密码长度至少为8位" | 显示验证错误信息 |
| 500 | 服务器错误 | "Internal Server Error" | 提示稍后重试 |

### 错误处理示例

```javascript
fetch('/api/tickets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  if (!response.ok) {
    // 处理错误
    if (response.status === 401) {
      // Token无效，跳转登录
      window.location.href = '/login';
    } else if (response.status === 403) {
      // 权限不足
      alert('权限不足');
    }
    return response.json().then(err => {
      throw new Error(err.detail);
    });
  }
  return response.json();
})
.then(data => {
  // 处理成功响应
  console.log(data);
})
.catch(error => {
  // 处理错误
  console.error(error.message);
});
```

---

## 完整流程示例

### 场景1: 新用户注册并创建工单

```javascript
// 步骤1: 发送验证码
fetch('http://localhost:8000/api/auth/send-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com'
  })
})
.then(res => res.json())
.then(data => console.log('验证码已发送'));

// 步骤2: 用户输入收到的验证码，进行注册
fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'mypassword123',
    verification_code: '123456'  // 用户输入的验证码
  })
})
.then(res => res.json())
.then(user => console.log('注册成功:', user));

// 步骤3: 登录获取Token
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'mypassword123'
  })
})
.then(res => res.json())
.then(data => {
  const token = data.access_token;
  // 存储token
  localStorage.setItem('token', token);
  
  // 步骤4: 使用token创建工单
  return fetch('http://localhost:8000/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: '账单查询问题',
      ticket_type: 'financial',
      content: '无法查看本月账单明细'
    })
  });
})
.then(res => res.json())
.then(ticket => console.log('工单创建成功:', ticket));
```

### 场景2: 用户查看和更新工单

```javascript
const token = localStorage.getItem('token');

// 步骤1: 获取工单列表
fetch('http://localhost:8000/api/tickets?skip=0&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  console.log(`共有 ${data.total} 个工单`);
  const firstTicket = data.items[0];
  
  // 步骤2: 查看第一个工单详情
  return fetch(`http://localhost:8000/api/tickets/${firstTicket.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
})
.then(res => res.json())
.then(ticket => {
  console.log('工单详情:', ticket);
  
  // 步骤3: 如果工单状态是pending，可以更新
  if (ticket.status === 'pending') {
    return fetch(`http://localhost:8000/api/tickets/${ticket.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: ticket.content + '\n\n补充：我已经尝试重新登录，问题依然存在。'
      })
    });
  }
})
.then(res => res && res.json())
.then(updated => updated && console.log('工单已更新:', updated));
```

### 场景3: 查看业务账号和合同

```javascript
const token = localStorage.getItem('token');

// 步骤1: 获取业务账号
fetch('http://localhost:8000/api/business-accounts/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(account => {
  console.log('业务账号:', account);
  
  // 步骤2: 获取合同列表
  return fetch('http://localhost:8000/api/contracts/me?skip=0&limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
})
.then(res => res.json())
.then(data => {
  console.log(`共有 ${data.total} 个合同`);
  if (data.items.length > 0) {
    // 查看第一个合同详情
    return fetch(`http://localhost:8000/api/contracts/${data.items[0].id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
})
.then(res => res && res.json())
.then(contract => {
  console.log('合同详情:', contract);
  
  // 步骤3: 更新合同签署状态（示例：标记为已签署）
  if (contract && !contract.is_signed) {
    return fetch(`http://localhost:8000/api/contracts/${contract.id}/sign-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_signed: true })
    });
  }
})
.then(res => res && res.json())
.then(updatedContract => updatedContract && console.log('签署状态已更新:', updatedContract));
```

### 场景4: 查看项目和下载文件

```javascript
const token = localStorage.getItem('token');

// 步骤1: 获取项目列表
fetch('http://localhost:8000/api/projects/me?skip=0&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  console.log(`共有 ${data.total} 个项目`);
  if (data.items.length > 0) {
    const project = data.items[0];
    
    // 步骤2: 获取项目文件列表
    return fetch(`http://localhost:8000/api/projects/${project.id}/files?skip=0&limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
})
.then(res => res && res.json())
.then(fileData => {
  if (fileData && fileData.items.length > 0) {
    const file = fileData.items[0];
    
    // 步骤3: 获取文件下载URL
    return fetch(`http://localhost:8000/api/projects/files/${file.id}/download-url`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
})
.then(res => res && res.json())
.then(downloadData => {
  if (downloadData) {
    console.log('下载URL:', downloadData.download_url);
    // 使用下载URL下载文件
    window.open(downloadData.download_url);
  }
});
```

---

## 前端实现建议

### 1. Token管理

```javascript
// Token存储
class AuthService {
  setToken(token) {
    localStorage.setItem('access_token', token);
  }
  
  getToken() {
    return localStorage.getItem('access_token');
  }
  
  removeToken() {
    localStorage.removeItem('access_token');
  }
  
  isLoggedIn() {
    return !!this.getToken();
  }
}
```

### 2. API请求封装

```javascript
class ApiClient {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token过期，跳转登录
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    
    // 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }
  
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// 使用示例
const api = new ApiClient();

// 登录
api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
}).then(data => {
  localStorage.setItem('access_token', data.access_token);
});

// 获取工单列表
api.get('/tickets', { skip: 0, limit: 10 })
  .then(data => console.log(data));

// 创建工单
api.post('/tickets', {
  title: '问题标题',
  ticket_type: 'technical',
  content: '问题描述'
}).then(ticket => console.log(ticket));
```

### 3. 错误处理

```javascript
// 统一错误处理
function handleApiError(error) {
  // 根据错误类型显示不同提示
  if (error.message.includes('验证码')) {
    showNotification('验证码错误，请重新获取', 'error');
  } else if (error.message.includes('权限')) {
    showNotification('权限不足', 'error');
  } else {
    showNotification('操作失败，请稍后重试', 'error');
  }
}

// 使用
api.post('/tickets', data)
  .then(ticket => {
    showNotification('工单创建成功', 'success');
  })
  .catch(handleApiError);
```

### 4. 分页组件数据

```javascript
// 分页数据获取
async function fetchTickets(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const data = await api.get('/tickets', { skip, limit: pageSize });
  
  return {
    items: data.items,
    total: data.total,
    currentPage: page,
    totalPages: Math.ceil(data.total / pageSize)
  };
}

// 使用
fetchTickets(1, 10).then(paginatedData => {
  // 渲染列表
  renderTicketList(paginatedData.items);
  // 渲染分页器
  renderPagination(paginatedData);
});
```

### 5. Markdown渲染

合同和项目的概述使用 Markdown 格式，前端需要渲染：

```javascript
// 使用 marked 库渲染 Markdown
import { marked } from 'marked';

function renderMarkdown(markdown) {
  return marked.parse(markdown);
}

// React 示例
function ContractDetail({ contract }) {
  const html = renderMarkdown(contract.content_markdown);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### 6. 文件下载处理

```javascript
// 获取并下载文件
async function downloadFile(fileId) {
  try {
    // 获取下载URL
    const { download_url } = await api.post(`/projects/files/${fileId}/download-url`);
    
    // 创建临时链接下载
    const link = document.createElement('a');
    link.href = download_url;
    link.download = ''; // 让浏览器自动识别文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    handleApiError(error);
  }
}
```

---

## 开发环境说明

### 验证码获取

**开发环境**:
- 如果未配置邮件服务，验证码会输出到服务器控制台
- 可以从服务器日志中查看验证码

**生产环境**:
- 验证码会通过邮件发送到用户邮箱
- 有效期为10分钟

---

## 附录

### 时间格式

所有时间字段使用 **ISO 8601** 格式：

```
2024-01-01T10:30:00
2024-01-01T10:30:00Z  // UTC时间
```

**JavaScript解析示例**:

```javascript
const date = new Date('2024-01-01T10:30:00Z');
console.log(date.toLocaleString()); // 本地时间格式
```

### 工单类型中英文对照

| 英文 | 中文 | 说明 |
|------|------|------|
| financial | 财务问题 | 账单、付款、发票等 |
| technical | 技术问题 | 系统bug、功能异常等 |
| business | 业务问题 | 业务咨询、流程问题等 |

### 工单状态中英文对照

| 英文 | 中文 | 说明 |
|------|------|------|
| pending | 待回复 | 工单已创建，等待管理员处理 |
| replied | 已回复 | 管理员已回复，工单处理完成 |

### 业务账号状态中英文对照

| 英文 | 中文 | 说明 |
|------|------|------|
| pending | 待审核 | 已申请，等待管理员审核 |
| active | 已激活 | 已分配专属邮箱，可以正常使用 |
| disabled | 已禁用 | 账号已被禁用 |

---

## 联系支持

如有API使用问题，请：

1. 查看 [Swagger文档](https://api.dreamreflex.com/docs) - 可在线测试（仅限已登录用户）
2. 查看服务器日志获取详细错误信息
3. 联系技术支持团队

---

**文档版本**: v2.1.0  
**最后更新**: 2025-12-29  
**维护者**: Dreamreflex DevOps Team  
**目标用户**: 客户及二次开发者
