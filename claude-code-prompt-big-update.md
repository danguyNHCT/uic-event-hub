# Big Update: Admin Inline-Editing + Thông báo khẩn + Bottom Nav

## Bối cảnh
App React + Vite + Tailwind CSS tĩnh, hiện đọc dữ liệu từ `trip-data.json`/`seedData.js` cố định trong code. Update này thêm khả năng admin chỉnh sửa dữ liệu trực tiếp qua Google Sheet + Apps Script làm backend, trong khi vẫn giữ file dữ liệu tĩnh làm phương án dự phòng.

**QUAN TRỌNG: Không tự ý điều chỉnh bất kỳ chức năng, giao diện nào hiện có ngoài phạm vi mô tả dưới đây. Nếu phát hiện xung đột với code hiện tại, dừng lại và báo rõ trước khi tiếp tục.**

---

## 1. Cấu hình Apps Script URL

Thêm hằng số vào `content.js` (hoặc file config tương ứng đang chứa các giá trị cấu hình khác của project):

```js
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQi1BSQfPIpvJ3HuUr4w_o8QWmP4lfYppL0seBPKhWPDGe9hSppqbAxsPz7dDPeG24/exec";
export const ADMIN_PIN = "9292";
```

---

## 2. Data Layer — Tải dữ liệu từ Apps Script, fallback về file tĩnh

Tạo 1 module mới (ví dụ `src/services/dataService.js`) chịu trách nhiệm:

- Gọi `GET {APPS_SCRIPT_URL}?action=getAll` để lấy toàn bộ dữ liệu (9 tab, cấu trúc JSON trả về là `{ success: true, data: { Announcements: [...], DetailedAgenda_Trip1: [...], ... } }`).
- Nếu request thành công (`success: true`) → dùng dữ liệu từ Apps Script, chuyển đổi lại đúng shape mà các component hiện tại đang cần (map lại field nếu tên khác với `trip-data.json` gốc — xem mục 3 bên dưới về mapping).
- Nếu request thất bại (lỗi mạng, timeout, `success: false`, hoặc response không hợp lệ) → fallback về dữ liệu tĩnh trong `trip-data.json`/`seedData.js` như hiện tại, và set 1 state cờ `isOfflineMode = true`.
- Hàm này được gọi lần đầu khi app load, và lặp lại theo đúng chu kỳ polling ~60s đã có sẵn (tái sử dụng cơ chế auto-reload hiện tại, không tạo interval mới song song).
- Khi đang ở `isOfflineMode = true` VÀ admin mode đang bật, hiển thị 1 banner nhỏ (không che nội dung, có thể đặt ngay dưới Header) với nội dung "⚠️ Đang dùng dữ liệu ngoại tuyến" (EN: "⚠️ Offline mode - using cached data"). Banner này CHỈ hiện khi admin mode đang bật, người dùng thường không thấy.

## 3. Mapping dữ liệu Apps Script → shape hiện tại của app

Dữ liệu trả về từ Apps Script có tên field hơi khác với cấu trúc gốc trong `trip-data.json`. Cần viết hàm chuyển đổi (transform) trong `dataService.js`:

**DetailedAgenda_Trip1 / DetailedAgenda_Trip2** (mỗi dòng từ Sheet) →
```js
{
  date: `${row.dayName}\n${row.dateShort}`,  // ghép lại đúng format cũ "Friday\n04/09"
  time: row.endTime ? `${row.startTime} - ${row.endTime}` : row.startTime,  // ghép lại đúng format cũ
  group: row.group || null,
  activity: row.activity || null,
  note: row.note || null,
  mapsUrl: row.mapsUrl || undefined,  // undefined nếu rỗng để component ẩn field này
  menu: row.menu ? row.menu.split(';').filter(Boolean) : undefined,  // undefined nếu rỗng
}
```
Sắp xếp mảng kết quả theo `startTime` (parse giờ để so sánh); nếu `startTime` rỗng ở cả 2 dòng so sánh, giữ nguyên thứ tự theo cột `order` gốc.

**GeneralAgenda** (đã là danh sách phẳng từ Sheet, cần gộp lại thành ma trận `days` × `rows[period].cells` để KHÔNG đổi giao diện hiển thị cho user thường):
- Lấy danh sách `date` duy nhất, sắp xếp theo thứ tự xuất hiện đầu tiên trong dữ liệu (đã sort theo `order`) → đây là mảng `days`.
- Với mỗi `period` (Morning/Afternoon/Evening, theo đúng thứ tự cố định này bất kể dữ liệu), với mỗi `date` trong `days`: gom các dòng có cùng `period` + `date`, sắp xếp theo `order`, nối lại thành 1 cell text: nếu dòng có `group` thì format `"${group}: ${content}"`, nếu không có `group` thì chỉ `content`; nhiều dòng trong cùng cell nối bằng `\n`.
- Kết quả cuối cùng đúng shape gốc: `{ days: [...], rows: [{ period, cells: [...] }, ...] }`.

**Attendees_Trip1 / Attendees_Trip2** →
```js
{
  bookedByUIC: rows.filter(r => r.bookingType === 'bookedByUIC').map(toPersonObject),
  selfBooking: rows.filter(r => r.bookingType === 'selfBooking').map(toPersonObject),
}
// toPersonObject: { no: <thứ tự trong mảng, 1-indexed>, empCode: row.empCode || null, name: row.name, office: row.office || null, dept: row.dept || null, isFamily: row.isFamily }
```

**RoomShare_Trip1 / RoomShare_Trip2** → gom các dòng theo `roomNo`, mỗi nhóm thành `{ roomNo, members: [...] }`, member dùng cùng `toPersonObject` như trên, sắp xếp trong phòng theo `order`.

**TravelNotices** → `{ icon: row.icon, en: row.textEn, vi: row.textVi }`, sắp xếp theo `order`.

**Announcements** → giữ nguyên field (`id, content, startTime, endTime`), dùng cho mục 6 bên dưới.

---

## 4. Cơ chế Admin Mode

### 4.1 Kích hoạt
- Gõ 3 lần liên tiếp vào Header (trong khoảng 2 giây, giống double-tap nhưng x3) → hiện popup nhập PIN.
- Popup gửi `POST {APPS_SCRIPT_URL}` với body `{ action: "verifyPin", pin: "<giá trị nhập>" }`.
- Nếu response `{ valid: true }` → set state `isAdminMode = true` (lưu trong React state/context, KHÔNG lưu localStorage/sessionStorage) → đóng popup.
- Nếu sai → hiện thông báo lỗi ngắn trong popup, không đóng.

### 4.2 Phạm vi
- `isAdminMode` là 1 state global (Context hoặc props drilling từ App gốc), áp dụng cho toàn bộ 6 tile khi đã bật — không cần nhập lại PIN khi chuyển tile.
- Thoát: F5/reload trang → state mất, quay về chế độ xem thường. Không cần nút thoát riêng.

### 4.3 Sửa tại chỗ (inline edit)
- Khi `isAdminMode = true`, mọi field text hiển thị (activity, note, name, content...) chuyển thành có thể click để sửa tại chỗ — dùng `contentEditable` hoặc input/textarea overlay tùy theo layout hiện tại của từng component, miễn giữ đúng kiểu dáng hiển thị hiện có (font, size, màu) khi KHÔNG đang focus vào ô đó.
- Khi rời khỏi ô (`onBlur`), tự động gọi:
```js
POST {APPS_SCRIPT_URL}
body: { action: "update", pin: ADMIN_PIN, targetTab: "<tên tab tương ứng>", rowId: "<id dòng>", rowData: { <field đã sửa>: <giá trị mới> } }
```
- Response trả về `{ success: true, editHistoryId: "..." }` → lưu `editHistoryId` vào state tạm, hiện nút "↩ Hoàn tác" nhỏ cạnh dòng vừa sửa trong 5 giây (hoặc đến khi admin sửa dòng khác thì ẩn nút của dòng trước).
- Bấm "↩ Hoàn tác" → gọi `POST { action: "rollback", pin: ADMIN_PIN, editHistoryId }` → sau khi thành công, cập nhật lại giá trị hiển thị bằng cách gọi lại `getAll` (đơn giản, tránh xử lý state phức tạp).

### 4.4 Thêm dòng mới
- Khi `isAdminMode = true`, hiện nút "+" nhỏ ở CẢ ĐẦU LẪN CUỐI mỗi danh sách/nhóm (Detailed Agenda mỗi ngày, Attendees mỗi loại booking, Room Share mỗi phòng, Travel Notices, danh sách phòng trong Room Share, và danh sách Thông báo khẩn).
- Bấm "+" → tạo 1 dòng trống ngay tại vị trí đó (đầu hoặc cuối) với các field để trống, admin gõ trực tiếp vào (dùng cơ chế inline edit ở 4.3), gọi:
```js
POST {APPS_SCRIPT_URL}
body: { action: "create", pin: ADMIN_PIN, targetTab: "<tên tab>", rowData: { <field ban đầu, có thể rỗng> }, insertAt: "start" | "end" }
```
- Riêng Detailed Agenda: field `startTime` là BẮT BUỘC khi tạo dòng mới — nếu để trống khi blur, hiện cảnh báo nhỏ "Cần nhập giờ bắt đầu" và không cho lưu tới khi có giá trị.

### 4.5 Xóa dòng
- Khi `isAdminMode = true`, hiện icon thùng rác nhỏ trên mỗi dòng.
- Bấm → xác nhận nhanh (window.confirm hoặc modal nhỏ) → gọi:
```js
POST {APPS_SCRIPT_URL}
body: { action: "delete", pin: ADMIN_PIN, targetTab: "<tên tab>", rowId: "<id dòng>" }
```
- Response trả về `editHistoryId` → hiện nút "↩ Hoàn tác" như mục 4.3 (rollback khi xóa nhầm sẽ tạo lại dòng đó).

---

## 5. General Agenda — Kéo thả trong màn Admin

- **Màn User thường**: giữ NGUYÊN giao diện ma trận hiện tại (period × day), không đổi gì.
- **Màn Admin (khi `isAdminMode = true`)**: hiển thị General Agenda dưới dạng DANH SÁCH DÒNG PHẲNG (khác hẳn ma trận), mỗi dòng gồm: ngày (dropdown chọn từ `days` có sẵn), buổi (dropdown Morning/Afternoon/Evening), group (dropdown Group 1/Group 2/để trống), nội dung (text, sửa tại chỗ theo 4.3).
- Dùng thư viện kéo thả nhẹ đã có sẵn trong project nếu có, hoặc `@dnd-kit/sortable` (thêm dependency nếu cần) để admin kéo thả TỰ DO bất kỳ dòng nào đến bất kỳ vị trí nào trong toàn bộ danh sách.
- Sau khi thả (`onDragEnd`), gọi:
```js
POST {APPS_SCRIPT_URL}
body: { action: "reorder", pin: ADMIN_PIN, targetTab: "GeneralAgenda", orderedIds: ["id1", "id2", ...] }  // theo đúng thứ tự mới sau khi kéo thả
```
- Nút "+" (đầu/cuối danh sách) tạo dòng mới theo 4.4, với form chọn ngày/buổi/group thay vì chỉ text tự do.
- Sau khi admin thao tác xong ở màn danh sách này, khi chuyển sang xem màn user thường (hoặc F5), giao diện ma trận tự động gộp lại đúng theo mục 3 (transform GeneralAgenda), phản ánh đúng thứ tự đã kéo thả.

---

## 6. Thông báo khẩn (Announcements)

- Vị trí: banner ở vị trí CAO NHẤT trang chủ, phía trên mục "Upcoming now" (nếu có) và 6 tile.
- Hiển thị: chỉ hiện thông báo có `startTime <= now <= endTime` (nếu `endTime` rỗng thì luôn hiện miễn đã qua `startTime`), so sánh theo giờ Hanoi (GMT+7). Nếu không có thông báo nào đang active, ẩn hẳn khu vực banner (không chiếm không gian trống).
- Nếu có nhiều thông báo active cùng lúc, xếp chồng theo `order`, admin có thể kéo thả thứ tự tương tự General Agenda (dùng `action: "reorder"` với `targetTab: "Announcements"`) — có thể bỏ qua drag-drop cho mục này nếu muốn đơn giản hóa, chỉ cần liệt kê theo `order` hiện có, KHÔNG bắt buộc phải làm kéo thả cho Announcements nếu thấy phức tạp hóa không cần thiết.
- Quản lý (khi `isAdminMode = true`): hiện icon bút chì nhỏ hoặc nút riêng "Quản lý thông báo" ngay trên banner (hoặc ẩn trong 1 nút nổi góc màn hình) mở ra form:
  - Chọn giờ bắt đầu: mặc định = "Ngay bây giờ" (checkbox), hoặc chọn thời điểm cụ thể trong tương lai.
  - Chọn giờ kết thúc: để trống = vô thời hạn, hoặc chọn thời điểm cụ thể.
  - Nội dung (textarea).
  - Nút "Tạo thông báo" → gọi `action: "create"`, `targetTab: "Announcements"`.
  - Danh sách các thông báo hiện có (kể cả chưa/đã hết hạn), mỗi dòng có nút xóa riêng → gọi `action: "delete"`.

---

## 7. Bottom Nav — Căn giữa 2 icon

- Hiện tại bottom nav chỉ có 2 mục Home và Contact nhưng chưa căn giữa/cân đối đẹp trong khung nav.
- Sửa CSS/layout của component bottom nav để 2 icon (kèm label nếu có) phân bố đều, cân đối trong toàn bộ chiều ngang thanh nav — dùng `justify-content: space-evenly` hoặc flex tương đương, đảm bảo khoảng cách 2 bên mép và giữa 2 icon trông cân xứng trên các kích thước màn hình điện thoại phổ biến.
- Không cần xử lý gì liên quan đến badge quảng cáo Netlify (đã chốt bỏ qua việc này).

---

## Ghi chú triển khai chung
- Toàn bộ request tới Apps Script dùng `fetch` thuần, xử lý try-catch đầy đủ, timeout hợp lý (ví dụ 8 giây) trước khi coi là lỗi và fallback.
- Giữ nguyên toàn bộ giao diện, route, và hành vi hiện có của app cho user KHÔNG ở admin mode — thay đổi duy nhất mà user thường thấy được là: (a) Thông báo khẩn nếu có, (b) bottom nav căn giữa hơn.
- Nếu trong quá trình code phát hiện cấu trúc thực tế của component nào đó (ví dụ Detailed Agenda, Room Share) khác với mô tả trong prompt này, dừng lại, không tự suy đoán/sửa khác đi — báo lại để xác nhận trước khi tiếp tục.
