# Báo cáo tổng quan dự án BaseCore

## 1. Mục tiêu hệ thống

BaseCore là một hệ thống web quản lý bán hàng được tổ chức theo hướng nhiều project/microservice. Hệ thống gồm giao diện React cho người dùng và quản trị viên, API Gateway làm cổng truy cập chung, các service backend xử lý xác thực, quản lý dữ liệu nghiệp vụ và các thư viện dùng chung.

Các nghiệp vụ chính hiện có:

- Đăng nhập, đăng ký, phân quyền người dùng theo vai trò.
- Quản lý người dùng dành cho quản trị viên.
- Quản lý sản phẩm, danh mục sản phẩm và nhà cung cấp.
- Người dùng xem sản phẩm, đặt hàng và theo dõi đơn hàng.
- Quản trị viên xem danh sách đơn hàng, lọc đơn, thống kê doanh thu, duyệt hoặc từ chối đơn.
- Ghi nhận lỗi/audit log ở project riêng.

## 2. Kiến trúc tổng thể

Luồng truy cập chính:

1. Người dùng thao tác trên `BaseCore.WebClient`.
2. Web client gọi API qua đường dẫn `/api`.
3. Vite dev server proxy `/api` về `BaseCore.ApiGateway` tại `http://localhost:5000`.
4. API Gateway dùng Ocelot chuyển tiếp request:
   - Auth, users, roles sang `BaseCore.AuthService` tại port `5002`.
   - Products, categories, orders, suppliers sang `BaseCore.APIService` tại port `5001`.
5. Các service backend dùng `BaseCore.Repository`, `BaseCore.Services`, `BaseCore.Entities`, `BaseCore.Common` để xử lý dữ liệu và nghiệp vụ.
6. Dữ liệu được lưu qua Entity Framework Core, cấu hình hiện tại dùng SQL Server.

## 3. Danh sách project và vai trò

### 3.1. `BaseCore.WebClient`

Đây là project frontend React/Vite. Project này cung cấp giao diện thao tác cho cả người dùng thường và quản trị viên.

Công nghệ chính:

- React 18.
- Vite.
- React Router.
- Axios.
- Bootstrap, Font Awesome.

Các màn hình chính:

- `/login`: đăng nhập hệ thống.
- `/`: trang chủ người dùng.
- `/menu`: trang xem danh sách/menu sản phẩm.
- `/about`: trang giới thiệu.
- `/book`: trang đặt hàng.
- `/admin`: dashboard quản trị.
- `/products`: quản lý sản phẩm.
- `/categories`: quản lý danh mục.
- `/users`: quản lý người dùng.
- `/bills`: quản lý đơn hàng/hóa đơn.
- `/suppliers`: quản lý nhà cung cấp.

Nghiệp vụ frontend:

- Lưu JWT token và thông tin người dùng trong `localStorage`.
- Tự gắn token vào header `Authorization: Bearer ...` khi gọi API.
- Tự chuyển về trang đăng nhập khi API trả về lỗi `401`.
- Bảo vệ route bằng `ProtectedRoute`; các trang admin yêu cầu quyền `Admin`.
- Gọi API tập trung qua `src/services/api.js`.

### 3.2. `BaseCore.ApiGateway`

Đây là API Gateway dùng Ocelot. Project này đóng vai trò cổng vào duy nhất cho frontend.

Chức năng chính:

- Nhận request từ frontend tại `http://localhost:5000`.
- Định tuyến request theo cấu hình `ocelot.json`.
- Gom nhiều backend service thành một API surface chung `/api`.
- Hỗ trợ CORS để frontend có thể gọi API trong môi trường development.

Các route chính:

- `/api/auth/*` -> `BaseCore.AuthService`.
- `/api/users/*` -> `BaseCore.AuthService`.
- `/api/roles/*` -> `BaseCore.AuthService`.
- `/api/products/*` -> `BaseCore.APIService`.
- `/api/categories/*` -> `BaseCore.APIService`.
- `/api/orders/*` -> `BaseCore.APIService`.
- `/api/suppliers/*` -> `BaseCore.APIService`.

### 3.3. `BaseCore.AuthService`

Đây là service xử lý xác thực, đăng ký, quản lý người dùng và vai trò.

Chức năng chính:

- Đăng nhập bằng username/password.
- Sinh JWT token sau khi đăng nhập thành công.
- Đăng ký tài khoản người dùng thường.
- Quản lý danh sách người dùng cho admin.
- Cập nhật, xóa, kích hoạt hoặc khóa người dùng.
- Cung cấp danh sách role và quyền tương ứng.

API chính:

- `POST /api/auth/login`: đăng nhập, trả về token và thông tin user.
- `POST /api/auth/register`: đăng ký tài khoản user.
- `GET /api/users`: admin xem danh sách user, có tìm kiếm và phân trang.
- `GET /api/users/{id}`: xem chi tiết user.
- `POST /api/users`: admin tạo user.
- `PUT /api/users/{id}`: admin cập nhật user.
- `DELETE /api/users/{id}`: admin xóa user.
- `GET /api/roles`: admin xem danh sách role.
- `GET /api/roles/{id}/permissions`: xem quyền theo role.

Nghiệp vụ phân quyền:

- `UserType = 1` được ánh xạ thành role `Admin`.
- `UserType = 0` được ánh xạ thành role `User`.
- Admin có quyền quản lý user, role, sản phẩm, danh mục, đơn hàng.
- User thường chủ yếu xem sản phẩm, đặt hàng và xem đơn của mình.

Dữ liệu khởi tạo:

- Tài khoản admin mặc định: `admin / admin123`.
- Tài khoản user mặc định: `user / user123`.

### 3.4. `BaseCore.APIService`

Đây là service xử lý nghiệp vụ bán hàng chính: sản phẩm, danh mục, đơn hàng và nhà cung cấp.

Chức năng quản lý sản phẩm:

- Xem danh sách sản phẩm có phân trang.
- Tìm kiếm sản phẩm theo keyword.
- Lọc theo danh mục, khoảng giá, size.
- Xem chi tiết sản phẩm.
- Admin tạo, cập nhật, xóa sản phẩm.
- Sản phẩm có các thông tin: tên, giá, tồn kho, size, rating, hình ảnh, mô tả, danh mục.

Chức năng quản lý danh mục:

- Xem danh sách danh mục.
- Xem chi tiết danh mục.
- Admin tạo, cập nhật, xóa danh mục.
- Kiểm tra trùng tên danh mục khi tạo mới.

Chức năng quản lý đơn hàng:

- User tạo đơn hàng từ danh sách sản phẩm.
- Kiểm tra sản phẩm tồn tại trước khi tạo đơn.
- Kiểm tra tồn kho trước khi đặt.
- Tự tính tổng tiền đơn hàng.
- Trừ tồn kho sau khi đặt hàng thành công.
- User xem danh sách đơn hàng của mình.
- User hủy đơn nếu đơn chưa hoàn thành.
- Khi hủy đơn, hệ thống hoàn lại tồn kho.
- Admin xem tất cả đơn hàng, lọc theo trạng thái và ngày.
- Admin xem thống kê số đơn hoàn thành và doanh thu.
- Admin duyệt hoặc từ chối đơn hàng.
- Admin cập nhật trạng thái đơn: chờ duyệt, đang giao, hoàn thành, đã hủy.

Trạng thái đơn hàng:

- `PendingApproval`: chờ duyệt.
- `Approved`: đã duyệt.
- `Rejected`: từ chối.
- `Cancelled`: đã hủy.
- `Completed`: hoàn thành.
- `Shipping`: đang giao.

Chức năng quản lý nhà cung cấp:

- Admin xem danh sách nhà cung cấp, có tìm kiếm và phân trang.
- Admin xem chi tiết nhà cung cấp.
- Admin tạo, cập nhật, xóa nhà cung cấp.
- Thông tin nhà cung cấp gồm: tên, người liên hệ, số điện thoại, email, địa chỉ, loại cung cấp, trạng thái hoạt động, ghi chú.

### 3.5. `BaseCore.Services`

Đây là tầng business service. Project này gom các xử lý nghiệp vụ nằm giữa controller và repository.

Các nghiệp vụ chính:

- `OrderService`: xử lý nghiệp vụ đơn hàng.
- Lấy danh sách đơn theo user.
- Lấy chi tiết đơn hàng.
- Lọc đơn hàng theo trạng thái và thời gian.
- Tính thống kê doanh thu/số đơn hoàn thành.
- Duyệt đơn hàng.
- Từ chối đơn hàng.
- Hủy đơn hàng.
- `ProductService`, `CategoryService`: lớp service cho sản phẩm và danh mục.
- `Authen/UserService`: xác thực user, tạo user, cập nhật user, tìm kiếm user.

Vai trò của project này là giữ logic nghiệp vụ tập trung, tránh để controller xử lý quá nhiều.

### 3.6. `BaseCore.Repository`

Đây là tầng truy cập dữ liệu.

Chức năng chính:

- Cấu hình `MySqlDbContext`, mặc dù tên là MySql nhưng cấu hình runtime hiện tại đang dùng SQL Server.
- Khai báo `DbSet` cho:
  - `Users`.
  - `Products`.
  - `Categories`.
  - `Orders`.
  - `OrderDetails`.
  - `Suppliers`.
- Cấu hình quan hệ giữa bảng:
  - Product thuộc Category.
  - Order có nhiều OrderDetail.
  - OrderDetail liên kết Product.
- Cấu hình precision cho giá tiền.
- Cấu hình unique index cho username và email.
- Chứa migration EF Core.
- Chứa repository generic và repository riêng cho user, product, category, order, order detail.

Dữ liệu seed ban đầu:

- Các danh mục mẫu: Electronics, Clothing, Books, Home & Garden, Sports.
- Một số sản phẩm mẫu.
- Tài khoản admin mặc định.

### 3.7. `BaseCore.Entities`

Đây là project chứa các entity/domain model dùng chung trong hệ thống.

Entity chính:

- `User`: thông tin tài khoản, mật khẩu hash/salt, email, phone, role thông qua `UserType`, trạng thái hoạt động.
- `Product`: sản phẩm, giá, tồn kho, size, rating, hình ảnh, mô tả, danh mục.
- `Category`: danh mục sản phẩm.
- `Order`: đơn hàng, user đặt, ngày đặt, tổng tiền, trạng thái, thông tin khách hàng, thông tin duyệt/từ chối.
- `OrderDetail`: chi tiết đơn hàng, sản phẩm, số lượng, đơn giá, tên sản phẩm snapshot.
- `Supplier`: nhà cung cấp.
- Các entity phân quyền mở rộng như `Role`, `Function`, `Module`, `UserRole`, `RoleModuleFunction`.

Vai trò của project này là định nghĩa cấu trúc dữ liệu lõi để các project khác cùng dùng.

### 3.8. `BaseCore.DTO`

Đây là project chứa các object truyền dữ liệu giữa các layer hoặc qua API.

Nhóm DTO chính:

- DTO phân trang, tìm kiếm, sắp xếp.
- DTO phản hồi API chuẩn như `ApiResponse`, `JsonRestApiResponse`.
- DTO cho nền tảng xác thực/phân quyền: user, role, module, function, role-module-function.

Vai trò của DTO là giúp tách dữ liệu API khỏi entity database, giảm phụ thuộc trực tiếp giữa tầng giao diện/API và tầng lưu trữ.

### 3.9. `BaseCore.Common`

Đây là project chứa thành phần dùng chung toàn hệ thống.

Chức năng chính:

- `TokenHelper`: sinh JWT token, hash password, xử lý xác thực.
- `Enums`: các enum dùng chung, trong đó có `OrderStatus`.
- `Constants`, `AppSettings`, `Entity`: hằng số và lớp nền tảng.
- Helper xử lý file/media.
- Redis utility.
- WebSocket helper/middleware.
- Role constant.

Project này giúp tránh lặp code giữa các service.

### 3.10. `BaseCore.Libs`

Đây là thư viện tiện ích phụ trợ.

Chức năng chính:

- Các hàm tiện ích chung trong `Utils`.
- Extension hỗ trợ LINQ.
- Helper xử lý enum.

Project này phù hợp cho các hàm nhỏ, dùng lại nhiều nơi, không gắn chặt với nghiệp vụ cụ thể.

### 3.11. `BaseCore.LogService`

Đây là thư viện xử lý log.

Chức năng chính:

- Định nghĩa entity log như `LogError`, `LogAction`.
- Service ghi và đọc log lỗi/hành động.
- Middleware xử lý exception.
- Extension để đăng ký middleware log vào pipeline.

Vai trò của project này là tách phần ghi nhận lỗi, audit hành động ra khỏi nghiệp vụ chính.

### 3.12. `BaseCore.AuditLog`

Đây là project API/MVC riêng phục vụ xem và tạo audit log.

API chính:

- `GET /api/auditLog`: lấy danh sách log lỗi.
- `POST /api/auditLog`: tạo log lỗi.
- `GET /api/auditLog/testError`: endpoint test phát sinh exception.

Project này dùng `BaseCore.LogService` để thao tác dữ liệu log.

### 3.13. `BaseCore.UnitTest`

Đây là project test tự động.

Vai trò:

- Chứa test cho service, hiện có `UnitTestUserService`.
- Chứa cấu hình test trong `appsettings.json`.
- Dùng để kiểm tra logic service độc lập với giao diện.

### 3.14. `Test`

Đây là project worker/service thử nghiệm.

Vai trò:

- Chứa `Worker.cs`, `Program.cs`.
- Có thể dùng để thử background worker hoặc các tác vụ chạy nền.
- Không nằm trong luồng nghiệp vụ chính của web bán hàng hiện tại.

### 3.15. `Examples`

Đây là thư mục ví dụ học tập.

Vai trò:

- Chứa các bài JavaScript mẫu.
- Không tham gia trực tiếp vào runtime chính của hệ thống BaseCore.

## 4. Các nhóm nghiệp vụ chính

### 4.1. Nghiệp vụ xác thực và phân quyền

1. Người dùng nhập username/password trên trang login.
2. Frontend gọi `POST /api/auth/login`.
3. Gateway chuyển request sang AuthService.
4. AuthService kiểm tra user và mật khẩu qua `UserService`.
5. Nếu hợp lệ, hệ thống sinh JWT token.
6. Frontend lưu token, user, role vào `localStorage`.
7. Các request sau tự gắn token vào header.
8. Backend dùng `[Authorize]` và `[Authorize(Roles = "Admin")]` để bảo vệ API.

### 4.2. Nghiệp vụ quản lý sản phẩm

Admin có thể thêm, sửa, xóa sản phẩm. Người dùng có thể xem và lọc sản phẩm. Khi đặt hàng thành công, tồn kho sản phẩm bị trừ theo số lượng trong đơn.

### 4.3. Nghiệp vụ quản lý danh mục

Danh mục dùng để nhóm sản phẩm. Khi tạo sản phẩm, hệ thống kiểm tra danh mục tồn tại. Khi tạo danh mục mới, hệ thống kiểm tra trùng tên.

### 4.4. Nghiệp vụ đặt hàng

1. User chọn sản phẩm và số lượng.
2. Hệ thống kiểm tra sản phẩm tồn tại.
3. Hệ thống kiểm tra tồn kho đủ.
4. Hệ thống tính tổng tiền.
5. Tạo order với trạng thái `PendingApproval`.
6. Tạo order detail.
7. Trừ tồn kho sản phẩm.
8. Admin duyệt, từ chối, chuyển trạng thái giao hàng hoặc hoàn thành.

### 4.5. Nghiệp vụ hủy đơn

User có thể hủy đơn nếu đơn chưa hoàn thành. Khi hủy, hệ thống cộng lại tồn kho cho các sản phẩm trong đơn và chuyển trạng thái đơn sang `Cancelled`.

### 4.6. Nghiệp vụ thống kê đơn hàng

Admin có thể lọc đơn theo trạng thái/ngày và xem thống kê:

- Tổng doanh thu từ đơn hoàn thành hoặc đã duyệt.
- Số lượng đơn hoàn thành.

### 4.7. Nghiệp vụ nhà cung cấp

Admin quản lý thông tin nhà cung cấp để phục vụ vận hành bán hàng, theo dõi nguồn cung, liên hệ và loại hàng cung cấp.

## 5. Cơ sở dữ liệu

Hệ thống sử dụng Entity Framework Core với SQL Server theo cấu hình hiện tại.

Các bảng chính:

- `Users`.
- `Products`.
- `Categories`.
- `Orders`.
- `OrderDetails`.
- `Suppliers`.

Quan hệ chính:

- `Products.CategoryId` liên kết với `Categories.Id`.
- `Orders` có nhiều `OrderDetails`.
- `OrderDetails.ProductId` liên kết với `Products.Id`.
- `Orders.UserId` lưu user đặt hàng.

## 6. Bảo mật

Cơ chế bảo mật chính:

- JWT Bearer Authentication.
- Password được hash kèm salt qua `TokenHelper`.
- Route admin được bảo vệ bằng role `Admin`.
- Frontend kiểm tra trạng thái đăng nhập và role trước khi cho vào trang admin.
- Backend vẫn là nơi quyết định quyền cuối cùng bằng attribute `[Authorize]`.

## 7. Cách chạy dự án ở môi trường development

Thứ tự chạy khuyến nghị:

1. Chạy `BaseCore.AuthService` tại port `5002`.
2. Chạy `BaseCore.APIService` tại port `5001`.
3. Chạy `BaseCore.ApiGateway` tại port `5000`.
4. Chạy frontend:

```bash
cd BaseCore.WebClient
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

Gateway chạy tại:

```text
http://localhost:5000
```

Tài khoản mặc định:

```text
Admin: admin / admin123
User:  user / user123
```

## 8. Nhận xét tổng quan

Dự án đã có cấu trúc khá đầy đủ cho một hệ thống bán hàng cơ bản:

- Frontend riêng biệt với backend.
- Backend tách AuthService, APIService và ApiGateway.
- Có tầng repository, service, entity, DTO và common.
- Có phân quyền admin/user.
- Có nghiệp vụ đơn hàng tương đối hoàn chỉnh: đặt, duyệt, từ chối, hủy, thống kê.
- Có quản lý dữ liệu nền: sản phẩm, danh mục, nhà cung cấp, người dùng.

Một số điểm có thể cải thiện tiếp:

- Đồng bộ lại tên `MySqlDbContext` vì cấu hình hiện tại đang dùng SQL Server.
- Đưa secret key JWT ra cấu hình an toàn hơn, tránh hard-code.
- Chuẩn hóa response API giữa các controller.
- Bổ sung kiểm tra quyền sở hữu đơn hàng khi user xem/hủy đơn.
- Mở rộng unit test cho sản phẩm, danh mục, đơn hàng và phân quyền.
- Tách DTO request/response ra khỏi controller để code dễ bảo trì hơn.

## 9. Liệt kê các hàm chính trong dự án

### 9.1. Các hàm frontend dùng trong `Products.jsx`

File: `BaseCore.WebClient/src/pages/Products.jsx`

Các hàm xử lý chính:

- `Products()`: component chính của trang quản lý sản phẩm.
- `loadCategories()`: gọi API lấy danh sách danh mục để hiển thị dropdown category.
- `loadProducts()`: gọi API tìm kiếm/lọc/phân trang sản phẩm.
- `handleSearch(e)`: xử lý form tìm kiếm, reset về trang 1 và tải lại sản phẩm.
- `openModal(product = null)`: mở modal thêm mới hoặc chỉnh sửa sản phẩm.
- `closeModal()`: đóng modal và reset lỗi/form edit.
- `handleSubmit(e)`: submit form thêm/sửa sản phẩm; gọi create hoặc update tùy `editingProduct`.
- `handleDelete(id)`: xác nhận và xóa sản phẩm.
- `renderPagination()`: render danh sách nút phân trang.
- `getCategoryName(product)`: lấy tên danh mục của sản phẩm từ dữ liệu product hoặc danh sách categories.

API wrapper được sử dụng:

- `categoryApi.getAll()`: lấy toàn bộ danh mục.
- `productApi.search(params)`: lấy danh sách sản phẩm theo keyword, category, price range, size, page, pageSize.
- `productApi.create(data)`: tạo sản phẩm mới.
- `productApi.update(id, data)`: cập nhật sản phẩm.
- `productApi.delete(id)`: xóa sản phẩm.

Backend tương ứng:

- `CategoriesController.GetAll()`
  - Route: `GET /api/categories`
  - Vai trò: trả về danh sách danh mục.
  - Được gọi khi `Products.jsx` chạy `loadCategories()`.

- `ProductsController.GetAll(keyword, categoryId, priceRange, size, page, pageSize)`
  - Route: `GET /api/products`
  - Vai trò: tìm kiếm, lọc và phân trang sản phẩm.
  - Được gọi khi `Products.jsx` chạy `loadProducts()`.
  - Gọi xuống `ProductRepositoryEF.SearchAsync(...)`.

- `ProductsController.Create(ProductCreateDto dto)`
  - Route: `POST /api/products`
  - Quyền: `Admin`.
  - Vai trò: tạo sản phẩm mới.
  - Kiểm tra danh mục tồn tại bằng `CategoryRepositoryEF.GetByIdAsync(...)`.
  - Gọi xuống `ProductRepositoryEF.AddAsync(...)`.

- `ProductsController.Update(int id, ProductUpdateDto dto)`
  - Route: `PUT /api/products/{id}`
  - Quyền: `Admin`.
  - Vai trò: cập nhật thông tin sản phẩm.
  - Gọi xuống `ProductRepositoryEF.GetByIdAsync(...)` và `ProductRepositoryEF.UpdateAsync(...)`.

- `ProductsController.Delete(int id)`
  - Route: `DELETE /api/products/{id}`
  - Quyền: `Admin`.
  - Vai trò: xóa sản phẩm.
  - Gọi xuống `ProductRepositoryEF.GetByIdAsync(...)` và `ProductRepositoryEF.DeleteAsync(...)`.

Repository/service liên quan:

- `ProductRepositoryEF.SearchAsync(...)`: lọc sản phẩm theo keyword, category, size, price range; sắp xếp mới nhất; phân trang.
- `ProductRepositoryEF.GetByCategoryAsync(categoryId)`: lấy sản phẩm theo danh mục.
- `Repository<Product>.GetByIdAsync(id)`: lấy chi tiết sản phẩm.
- `Repository<Product>.AddAsync(product)`: thêm sản phẩm.
- `Repository<Product>.UpdateAsync(product)`: cập nhật sản phẩm.
- `Repository<Product>.DeleteAsync(product)`: xóa sản phẩm.
- `CategoryRepositoryEF.GetByIdAsync(id)`: kiểm tra category tồn tại.
- `CategoryRepositoryEF.GetAllAsync()`: lấy danh sách category.

### 9.2. Các hàm frontend dùng trong `Bills.jsx`

File: `BaseCore.WebClient/src/pages/Bills.jsx`

Các hàm xử lý chính:

- `Bills()`: component chính của trang quản lý hóa đơn/đơn hàng.
- `normalizeBillStatus(status)`: chuẩn hóa nhiều dạng trạng thái backend thành nhóm hiển thị: `Pending`, `Shipping`, `Completed`, `Cancelled`.
- `getFieldValue(source, ...keys)`: đọc field linh hoạt theo nhiều kiểu tên key, ví dụ `userId`, `UserId`.
- `formatOrderDateTime(value)`: format ngày giờ đơn hàng theo định dạng Việt Nam.
- `loadBills()`: gọi API lấy danh sách đơn hàng và thống kê doanh thu.
- `handleViewDetails(bill)`: mở modal chi tiết đơn, gọi API lấy order detail và thông tin user.
- `handleCloseDetails()`: đóng modal chi tiết hóa đơn.
- `getDetailCustomer()`: gom thông tin khách hàng từ order và user.
- `handleConfirm(id)`: chuyển đơn hàng sang trạng thái `Shipping`.
- `handleCancel(id)`: hủy đơn hàng.
- `getStatusBadgeClass(status)`: chọn class CSS badge theo trạng thái.
- `getStatusText(status)`: trả về text trạng thái đã chuẩn hóa.
- `renderPagination()`: render phân trang danh sách hóa đơn.

API wrapper được sử dụng:

- `orderApi.getAll(params)`: lấy danh sách đơn hàng cho admin, có lọc trạng thái/ngày và phân trang.
- `orderApi.getStatistics(params)`: lấy thống kê doanh thu/số đơn theo khoảng ngày.
- `orderApi.getById(id)`: lấy chi tiết một đơn hàng.
- `orderApi.updateStatus(id, status)`: cập nhật trạng thái đơn hàng.
- `orderApi.cancel(id)`: hủy đơn hàng.
- `userApi.getById(userId)`: lấy thông tin user đặt hàng để hiển thị trong modal chi tiết.

Backend tương ứng:

- `OrdersController.GetAllOrders(OrderQueryDto query)`
  - Route: `GET /api/orders/all`
  - Quyền: `Admin`.
  - Vai trò: lấy danh sách đơn hàng, có lọc theo status, startDate, endDate, page, pageSize.
  - Được gọi trong `Bills.jsx` bởi `loadBills()`.
  - Gọi xuống `OrderService.GetOrdersAsync(query)`.

- `OrdersController.GetStatistics(OrderQueryDto query)`
  - Route: `GET /api/orders/statistics`
  - Quyền: `Admin`.
  - Vai trò: tính doanh thu và số đơn hoàn thành/đã duyệt.
  - Được gọi trong `Bills.jsx` bởi `loadBills()`.
  - Gọi xuống `OrderService.GetOrderStatisticsAsync(query)`.

- `OrdersController.GetById(int id)`
  - Route: `GET /api/orders/{id}`
  - Quyền: user đã đăng nhập.
  - Vai trò: lấy thông tin order và danh sách order detail.
  - Được gọi trong `Bills.jsx` bởi `handleViewDetails(bill)`.
  - Gọi xuống `OrderRepositoryEF.GetByIdAsync(id)` và `OrderDetailRepositoryEF.GetByOrderAsync(id)`.

- `UserController.GetById(int id)`
  - Route: `GET /api/users/{id}`
  - Quyền: user đã đăng nhập.
  - Vai trò: lấy thông tin user đặt hàng để hiển thị tên, email, số điện thoại.
  - Được gọi trong `Bills.jsx` bởi `handleViewDetails(bill)`.
  - Gọi xuống `UserService.GetById(id)`.

- `OrdersController.UpdateStatus(int id, UpdateStatusDto dto)`
  - Route: `PUT /api/orders/{id}/status`
  - Quyền: `Admin`.
  - Vai trò: cập nhật trạng thái đơn hàng sang `PendingApproval`, `Shipping`, `Completed` hoặc `Cancelled`.
  - Được gọi trong `Bills.jsx` bởi `handleConfirm(id)` với status `Shipping`.
  - Gọi xuống `OrderRepositoryEF.GetByIdAsync(id)` và `OrderRepositoryEF.UpdateAsync(order)`.

- `OrdersController.CancelOrder(int id)`
  - Route: `PUT /api/orders/{id}/cancel`
  - Quyền: user đã đăng nhập.
  - Vai trò: hủy đơn hàng nếu chưa hoàn thành và hoàn lại tồn kho sản phẩm.
  - Được gọi trong `Bills.jsx` bởi `handleCancel(id)`.
  - Gọi xuống `OrderRepositoryEF.GetByIdAsync(id)`, `OrderDetailRepositoryEF.GetByOrderAsync(id)`, `ProductRepositoryEF.GetByIdAsync(...)`, `ProductRepositoryEF.UpdateAsync(...)`, `OrderRepositoryEF.UpdateAsync(order)`.

Service/repository liên quan:

- `OrderService.GetOrdersAsync(query)`: xử lý phân trang, giới hạn pageSize, chuyển nhóm trạng thái và lấy danh sách đơn.
- `OrderService.GetOrderStatisticsAsync(query)`: tính doanh thu/số đơn theo trạng thái hoàn thành hoặc đã duyệt.
- `OrderService.ResolveStatusGroup(status)`: chuyển status từ UI thành danh sách enum backend.
- `OrderRepositoryEF.GetFilteredAsync(statuses, startDate, endDate, page, pageSize)`: lọc đơn hàng theo trạng thái/ngày và phân trang.
- `OrderRepositoryEF.CountFilteredAsync(statuses, startDate, endDate)`: đếm tổng số đơn sau lọc.
- `OrderRepositoryEF.SumByStatusesAsync(statuses, startDate, endDate)`: tính tổng doanh thu.
- `OrderRepositoryEF.GetByIdAsync(id)`: lấy order theo id.
- `OrderRepositoryEF.UpdateAsync(order)`: cập nhật order.
- `OrderDetailRepositoryEF.GetByOrderAsync(orderId)`: lấy danh sách sản phẩm trong đơn.
- `UserService.GetById(id)`: lấy user theo id.
- `UserRepositoryEF.GetByIdAsync(id)`: truy vấn user trong database.

### 9.3. Các hàm backend chính khác

Nhóm xác thực:

- `AuthController.Login(request)`: đăng nhập, sinh JWT token.
- `AuthController.Register(request)`: đăng ký user thường.
- `UserService.Authenticate(username, password)`: kiểm tra username/password.
- `UserService.Create(user, password)`: tạo user và hash password.
- `UserService.Update(user, password)`: cập nhật user, đổi password nếu có.
- `UserService.Delete(id)`: xóa mềm user.
- `TokenHelper.GenerateToken(...)`: sinh JWT.
- `TokenHelper.HashPassword(...)`: hash password kèm salt.

Nhóm người dùng:

- `UserController.GetAll(keyword, page, pageSize)`: admin lấy danh sách user.
- `UserController.GetById(id)`: lấy chi tiết user.
- `UserController.Create(request)`: admin tạo user.
- `UserController.Update(id, request)`: admin cập nhật user.
- `UserController.Delete(id)`: admin xóa user.
- `UserRepositoryEF.SearchAsync(keyword, page, pageSize)`: tìm kiếm và phân trang user.

Nhóm role:

- `RolesController.GetAll()`: lấy danh sách role tĩnh.
- `RolesController.GetById(id)`: lấy role theo id.
- `RolesController.GetByUserType(userType)`: lấy role theo `UserType`.
- `RolesController.GetPermissions(id)`: lấy danh sách quyền theo role.

Nhóm danh mục:

- `CategoriesController.GetAll()`: lấy danh sách category.
- `CategoriesController.GetById(id)`: lấy chi tiết category.
- `CategoriesController.Create(dto)`: admin tạo category.
- `CategoriesController.Update(id, dto)`: admin cập nhật category.
- `CategoriesController.Delete(id)`: admin xóa category.
- `CategoryRepositoryEF.GetByNameAsync(name)`: kiểm tra trùng tên category.

Nhóm đơn hàng:

- `OrdersController.GetMyOrders()`: user xem đơn hàng của mình.
- `OrdersController.Create(dto)`: user tạo đơn hàng, kiểm tra tồn kho và trừ tồn kho.
- `OrdersController.GetPendingOrders()`: admin lấy danh sách đơn chờ duyệt.
- `OrdersController.ApproveOrder(id, request)`: admin duyệt đơn.
- `OrdersController.RejectOrder(id, request)`: admin từ chối đơn.
- `OrderService.ApproveOrderAsync(orderId, adminId, notes)`: xử lý duyệt đơn.
- `OrderService.RejectOrderAsync(orderId, adminId, notes)`: xử lý từ chối đơn.
- `OrderService.CancelOrderAsync(orderId, userId, notes)`: xử lý hủy đơn ở tầng service.

Nhóm nhà cung cấp:

- `SuppliersController.GetAll(keyword, page, pageSize)`: admin lấy danh sách supplier, tìm kiếm và phân trang.
- `SuppliersController.GetById(id)`: lấy chi tiết supplier.
- `SuppliersController.Create(supplier)`: tạo supplier.
- `SuppliersController.Update(id, supplier)`: cập nhật supplier.
- `SuppliersController.Delete(id)`: xóa supplier.

Nhóm audit/log:

- `AuditLogController.Get()`: lấy danh sách log lỗi.
- `AuditLogController.Post(model)`: tạo log lỗi.
- `AuditLogController.TestError()`: endpoint test exception.
- `LogErrorService.CreateAsync(model)`: ghi log lỗi.
- `LogErrorService.GetAllListAsync()`: lấy danh sách log lỗi.
