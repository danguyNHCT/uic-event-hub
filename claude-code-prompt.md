# Yêu cầu: Tái cấu trúc UIC Event Hub → UIC Company Trip 2026 App

## Bối cảnh
App hiện tại (React + Vite + Tailwind CSS) đang có 6 tile cũ (About the Event, Speakers,
Attendees, Commitments Wall, Evening Programme, Travel & Logistics) và Firebase Firestore
đã tích hợp cho Commitments Wall real-time.

Yêu cầu lần này: **thay đổi nội dung và cấu trúc điều hướng** để phục vụ đúng mục đích thực tế
— app cho chuyến du lịch công ty (Company Trip 2026, Quy Nhơn 4-7/9/2026), chia làm 2 nhóm/đợt
đi (Trip 1: 04-06/09, Trip 2: 05-07/09).

**QUAN TRỌNG:** Đây là thay đổi cấu trúc điều hướng chính (6 tile cũ → 6 tile mới + bottom bar
3 mục), nên các thành phần UI/kiến trúc khác (Firebase config, style hệ thống, content.js/
colors.js pattern, ngôn ngữ EN/VI toggle) **giữ nguyên theo kiến trúc hiện có** — chỉ thay nội
dung và thêm các trang/tab mới. Nếu phát hiện xung đột với bất kỳ tính năng nào đang chạy, dừng
lại và báo cáo trước khi tiếp tục.

---

## 1. Thay đổi cấu trúc điều hướng

### Bỏ hoàn toàn
- 6 tile cũ: About the Event, Speakers, Attendees (bản cũ), Commitments Wall, Evening
  Programme, Travel & Logistics
- Toàn bộ tính năng Commitments Wall (component, Firestore collection liên quan)

### Tile chính mới (grid trên màn hình chính) — 6 tile
1. **Agenda**
2. **Attendees**
3. **Sport Program**
4. **Gala Night**
5. **Room Share**
6. **Travel Notices**

### Bottom navigation bar mới — 3 mục
7. **Contact**
8. **Photo Walls**
9. **Chat**

Giữ nguyên style navy blue chủ đạo và pattern responsive/mobile hiện có của app.

---

## 2. Chi tiết từng trang

### 2.1 Agenda
- Trang con đầu tiên hiển thị **General Agenda**: bảng ma trận Period (Morning/Afternoon/
  Evening) × 4 ngày (Fri 4 Sep, Sat 5 Sep, Sun 6 Sep, Mon 7 Sep), mỗi ô có thể chứa nhiều dòng
  text (giữ line-break gốc, có phân biệt GROUP 1 / GROUP 2 trong cùng ô).
- Bên dưới (hoặc qua 2 tab): **Agenda - Trip 1** và **Agenda - Trip 2**, mỗi tab hiển thị dạng
  **timeline** theo Date → Time → Group → Activity → Note, đúng theo dữ liệu trong
  `trip-data.json` (khóa `detailedAgenda.trip1` / `detailedAgenda.trip2`).
- Trường `time` giữ nguyên định dạng text gốc (có thể là giờ đơn `"04:00"` hoặc khoảng giờ
  `"07:10 - 11:30"`) — không tự chuẩn hóa hay suy diễn lại, chỉ style hiển thị đẹp trên timeline
  cho cả 2 dạng độ dài text khác nhau.
- Với các dòng có `activity: null` (ví dụ nhóm "Danang" ở Trip 1 chưa có hoạt động cụ thể),
  hiển thị nhãn nhẹ kiểu "Chưa cập nhật / TBU" thay vì để trống trơ.

### 2.2 Attendees
- 2 tab cấp 1: **Trip 1** / **Trip 2**
- Mỗi tab chia 2 tab cấp 2: **Booked by UIC** / **Self-booking**
- Danh sách hiển thị: STT, Mã NV (nếu có), Họ tên, Văn phòng, Bộ phận
- Với người không có mã NV / văn phòng / bộ phận (đi cùng gia đình, không phải nhân viên UIC)
  → hiển thị nhãn **"Family"** thay cho các cột trống đó, không để ô rỗng.
- Dữ liệu nguồn: `trip-data.json` → `attendees.trip1` / `attendees.trip2`
  (`bookedByUIC` / `selfBooking`, field `isFamily: true` đánh dấu người thuộc diện Family).

### 2.3 Sport Program
- Hiển thị dạng timeline (Pickleball Tournament 2026), dùng dữ liệu lọc từ Agenda
  (activity chứa "Pickleball" hoặc filter theo hoạt động thể thao) — hoặc tách riêng thành mục
  cố định "13:30 - 17:00 — Pickleball Tournament 2026 — FLC pickleball courts area" áp dụng cho
  cả 2 trip (giờ giống nhau ở cả Trip 1 và Trip 2). Xác nhận cách lấy dữ liệu này phù hợp với
  bạn trước khi code nếu có nghi ngờ.

### 2.4 Gala Night
- Tương tự Sport Program: "18:30 — GALA Dinner — FLC Ruby Hall", áp dụng Saturday 05/09 cho
  cả 2 trip.

### 2.5 Room Share
- 2 tab: **Trip 1** / **Trip 2**
- Hiển thị theo từng phòng (roomNo), liệt kê các thành viên trong phòng đó (có thể 1, 2, hoặc
  nhiều hơn nếu là phòng gia đình).
- Người thuộc diện Family (`isFamily: true`) hiển thị nhãn **"Family"** thay cột Văn phòng/Bộ phận.
- Dữ liệu nguồn: `trip-data.json` → `roomShare.trip1` / `roomShare.trip2`.

### 2.6 Travel Notices
- Hiển thị dạng danh sách text tĩnh, dữ liệu nguồn: `trip-data.json` → `travelNotices`
  (mảng string, mỗi phần tử là 1 mục thông báo).

### 2.7 Contact
- Trang hiển thị thông tin liên hệ / hướng dẫn viên. **Nội dung cụ thể (tên, SĐT, vai trò)
  chưa có trong dữ liệu hiện tại** — tạo UI với placeholder rõ ràng để điền sau, đừng tự bịa
  thông tin liên hệ giả.

### 2.8 Photo Walls
- Giữ theo thiết kế đã thống nhất trước đó: Firebase Storage, giới hạn 5MB/ảnh, chỉ nhận định
  dạng ảnh, hiển thị dạng lưới/tường ảnh, người dùng tự nhập display name trước khi đăng, không
  cần xác thực, nội dung hiển thị ngay không qua duyệt.

### 2.9 Chat
- Giữ theo thiết kế đã thống nhất trước đó: Firestore real-time, tự nhập display name, không
  xác thực, nội dung hiển thị ngay.

---

## 3. Tính năng Admin (PIN) — MỞ RỘNG so với thiết kế cũ

Trước đây PIN admin chỉ dùng để xóa nội dung không phù hợp trên Commitments Wall (nay đã bỏ).
Nay PIN admin (dùng chung 1 mã, giữ nguyên cơ chế nhập PIN đã có) mở rộng thêm quyền:

- **Sửa/thêm/xóa người trong danh sách Attendees** (cả 2 trip, cả 2 section booked/self-booking)
- **Sửa/thêm/xóa người trong Room Share** (cả 2 trip, gán người vào phòng, tạo phòng mới)
- Xóa nội dung không phù hợp trên **Photo Walls** và **Chat** (thay thế vai trò cũ của
  Commitments Wall PIN)

→ Yêu cầu kiến trúc: **Attendees và Room Share phải chuyển từ dữ liệu tĩnh (content.js) sang
Firestore**, tương tự cách Commitments Wall đã làm trước đây, để admin sửa được mà không cần
deploy lại. Khi user thường (không nhập PIN) vào các trang này → chỉ xem (read-only).

### Seed dữ liệu ban đầu
- File `trip-data.json` đính kèm chứa đầy đủ dữ liệu Agenda, Attendees, Room Share, Travel
  Notices đã được làm sạch, đúng cấu trúc.
- Viết **script seed Firestore một lần** (chạy thủ công, không phải chạy mỗi lần load app) để
  đẩy `attendees` và `roomShare` từ `trip-data.json` vào các collection Firestore tương ứng.
- `detailedAgenda`, `generalAgenda`, `travelNotices` **không cần Firestore** — giữ tĩnh trong
  `content.js` như pattern hiện có, vì các mục này ít khả năng thay đổi và không cần admin sửa
  qua UI (nếu cần sửa, sửa trực tiếp `content.js` rồi deploy lại — cách này đơn giản hơn và tiết
  kiệm được thao tác Firestore không cần thiết).

---

## 4. File đính kèm
- `trip-data.json` — toàn bộ dữ liệu đã trích xuất và làm sạch từ file Excel gốc, sẵn sàng dùng
  để seed Firestore (Attendees, Room Share) và điền content.js (Agenda, General Agenda, Travel
  Notices).

## 5. Việc cần làm trước khi code
Nếu có bất kỳ điểm nào ở trên mâu thuẫn với cấu trúc code hiện tại (ví dụ: cách tổ chức
component, cách content.js đang được import, cách Firestore rules đang set up), vui lòng liệt
kê rõ các xung đột đó và hỏi lại trước khi chỉnh sửa, thay vì tự quyết định ghi đè.
