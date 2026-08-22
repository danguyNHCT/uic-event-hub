# Company Trip 2026 Quy Nhơn — Batch fixes v3

## QUY TẮC BẮT BUỘC TRƯỚC KHI BẮT ĐẦU

- **Không tự ý sửa bất kỳ chức năng/giao diện nào khác** ngoài phạm vi mô tả dưới đây. Nếu phát hiện xung đột hoặc ảnh hưởng tới phần code khác, DỪNG LẠI và báo lại trước khi tự quyết định.
- Thực hiện **tuần tự theo đúng thứ tự** các mục bên dưới (1 → 2 → 3 → 4 → 5 → 6 → 7), vì một số mục có phụ thuộc lẫn nhau (ghi rõ trong từng mục).
- Sau khi xong toàn bộ, chạy `npm run build` để kiểm tra không lỗi build trước khi bàn giao.
- Toàn bộ code/comment mới viết bằng tiếng Anh (giữ nhất quán với code hiện tại). Text hiển thị cho người dùng vẫn theo object `{ en, vi }` như pattern có sẵn.

---

## Việc 1 — Fix "nháy" dữ liệu cũ mỗi khi mở app

**File:** `src/DataContext.jsx`

**Nguyên nhân:** `useState(STATIC_DATA)` khiến app luôn render dữ liệu tĩnh cũ (từ `content.js`/`seedData.js`, đóng cứng lúc build) ngay khi mount, trước khi `refresh()` trong `useEffect` kịp fetch bản mới từ Apps Script và ghi đè lên. Khoảng thời gian chờ network round-trip này chính là hiện tượng "thấy thông tin cũ rồi nháy 1 cái ra thông tin mới" — xảy ra ở MỌI lần mở app, không phụ thuộc thời điểm admin vừa cập nhật hay đã lâu.

**Yêu cầu fix:**
- Thêm state `isLoading` (khởi tạo `true`).
- Trong lần fetch đầu tiên (mount), **KHÔNG** render `STATIC_DATA` ngay — hiển thị skeleton/loading state thay thế cho tới khi `refresh()` lần đầu hoàn tất (thành công hoặc thất bại).
- Chỉ fallback sang `STATIC_DATA` (kèm `isOfflineMode = true` như hiện tại) khi `refresh()` **thực sự thất bại** (network lỗi/timeout) — không phải là giá trị khởi tạo mặc định nữa.
- Sau lần fetch đầu tiên, các lần `refresh()` tiếp theo (từ `useAutoReload` polling mỗi 60s) giữ hành vi hiện tại — không cần hiện lại loading state mỗi lần poll, chỉ cập nhật `data` ngầm khi có kết quả mới.
- Skeleton loading nên đơn giản, nhất quán với màu sắc app hiện tại (`COLORS.pageBackground`, `COLORS.cardBackground`), không cần animation phức tạp.

**Lưu ý:** Đây là thay đổi ở tầng Context, ảnh hưởng tới mọi màn hình dùng `useTripData()` — cần test kỹ trên điện thoại thật rằng không có màn hình nào bị trắng/lỗi trong lúc `isLoading = true`.

---

## Việc 2 — Chuẩn hóa input ngày/giờ, fix bug ISO timestamp

**Phạm vi đã rà lại chính xác với code — CHỈ áp dụng 2 nơi sau, KHÔNG đụng GeneralAgenda:**

### 2a. DetailedAgenda (`src/components/Agenda.jsx`, component `AgendaRow`)

**Bug hiện tại:** `startTime`/`endTime` đang là `EditableField` (ô nhập chữ tự do). Khi admin nhập qua form, Google Sheet đôi khi tự động convert cell thành kiểu Date, khiến Apps Script trả về ISO timestamp thô (vd `2026-09-03T17:00:00.000Z`, hoặc giờ-epoch giả `1899-12-29T20:53:30.000Z`) thay vì text đã format sẵn như "Friday 04/09" / "04:00" mà các dòng cũ đang có.

**Yêu cầu fix:**
- Đổi input `startTime`/`endTime` trong `AgendaRow` (đoạn admin edit, dòng ~126-138) từ `EditableField` sang:
  - Trường **ngày** (`dayName` + `dateShort` — hiện đang tách riêng, chỉ set lúc `addRow`, cần thêm vào form edit luôn): `<select>` với đúng 4 lựa chọn cố định, hiển thị kèm thứ:
    - `Friday 04/09` (Fri 04/09)
    - `Saturday 05/09` (Sat 05/09)
    - `Sunday 06/09` (Sun 06/09)
    - `Monday 07/09` (Mon 07/09)
  - Trường **giờ** (`startTime`, `endTime`): `<input type="time">` — giao diện chọn giờ 24h gốc của trình duyệt/điện thoại.
- Khi lưu (`saveField`), ép giá trị về **text thuần**, đúng format các dòng cũ đang dùng — ví dụ giờ lưu dạng `"04:00"` (không phải object Date, không phải ISO string).
- Kiểm tra lại cột `startTime`/`endTime` tương ứng trong tab `DetailedAgenda_Trip1`/`DetailedAgenda_Trip2` của Google Sheet: đảm bảo format cột là **Plain text**, không phải Auto/Date, để Sheet không tự ý convert lại khi Apps Script ghi vào.
- Phần hiển thị cho người dùng thường (không phải admin) — dòng 179-234 — **giữ nguyên hoàn toàn**, không đổi gì, vì nó chỉ đọc `row.time`/`row.date` đã transform sẵn.

### 2b. Announcements (`src/components/AnnouncementsManager.jsx`)

**Yêu cầu:** Đổi **giao diện nhập** (không đổi cách lưu trữ) từ `<input type="datetime-local">` (dòng 87-92 cho start, dòng 99-104 cho end) sang cùng kiểu chọn như DetailedAgenda ở trên:
- Trường ngày: `<select>` với đúng 4 lựa chọn cố định 04/09 - 07/09/2026 (dùng chung danh sách với 2a nếu tiện, ví dụ tách thành constant `FIXED_TRIP_DATES` trong `content.js` để 2 nơi dùng chung, tránh lặp code).
- Trường giờ: `<input type="time">`.

**QUAN TRỌNG — không được đổi:**
- Hàm `hanoiLocalToIso()` hiện tại nhận `datetime-local` value và convert sang ISO UTC (bù trừ giờ Hà Nội +7). Logic này **vẫn phải giữ nguyên tinh thần** — chỉ đổi cách admin *nhập* ngày và giờ (2 ô riêng thay vì 1 ô lịch gộp), nhưng khi submit, code phải **ghép ngày + giờ đã chọn lại thành cùng một chuỗi `datetime-local`-tương đương** (hoặc trực tiếp tính ra ISO timestamp qua `Date.UTC` như hàm hiện tại đang làm), rồi lưu xuống Sheet dưới dạng **timestamp thật** (ISO string) như hiện tại — **KHÔNG** lưu thành text tĩnh kiểu "Friday 04/09".
- Lý do bắt buộc: cơ chế tự động ẩn/hiện thông báo (hàm `isActive()` trong `AnnouncementsBanner.jsx`) so sánh `nowMs` với `startTime`/`endTime` dạng timestamp thật. Nếu đổi sang lưu text tĩnh, tính năng tự ẩn/hiện sẽ hỏng hoàn toàn.
- Checkbox "Ngay bây giờ" (`startNow`) giữ nguyên hành vi hiện tại — không ảnh hưởng bởi thay đổi này.
- Phần hiển thị danh sách thông báo đã tạo (`AnnouncementRow`, dòng 20-39) giữ nguyên — vẫn đọc timestamp thật và format qua `toLocaleString()` như hiện tại.

**Không đụng vào GeneralAgenda** (`src/components/GeneralAgendaAdmin.jsx`) — component này chỉ có `<select>` cho `date` và `period`, không có input giờ tự do, không có bug này.

---

## Việc 3 — Đổi ngôn ngữ mặc định sang Tiếng Anh

**File:** `src/LanguageContext.jsx`

Đổi dòng:
```js
const [lang, setLang] = useState('vi');
```
thành:
```js
const [lang, setLang] = useState('en');
```

Giữ nguyên toàn bộ logic `toggleLang`, người dùng vẫn bấm nút VI/EN để đổi qua lại bình thường.

---

## Việc 4 — Bỏ bước bấm "Mở khoá" thừa + không lệch scroll/zoom sau khi vào Edit

**File:** `src/components/admin/PinModal.jsx`, có thể cần chạm `src/AdminContext.jsx`

**4a. Auto-submit khi nhập đủ PIN:**
- Hiện tại: nhập đủ 4 số vào ô PIN (input text 1 ô, không phải 4 ô số riêng) xong vẫn phải bấm nút "Mở khóa" (`handleSubmit`) mới xác thực.
- Yêu cầu: thêm `useEffect` theo dõi `pin` — khi `pin.length === 4` (đúng độ dài PIN, hiện là `9292`), tự động gọi `handleSubmit()` ngay, không cần chờ bấm nút hay Enter.
- Vẫn giữ nút "Mở khóa" hiển thị trên giao diện (để dùng dự phòng, ví dụ nếu người dùng paste PIN hoặc trường hợp khác), chỉ là không bắt buộc phải bấm nữa trong luồng nhập tay bình thường.
- Giữ nguyên toàn bộ xử lý lỗi (`setError(true)` khi PIN sai) và trạng thái `checking`.

**4b. Không lệch scroll/zoom khi vừa vào Edit Mode:**
- Bug quan sát được: sau khi nhập PIN đúng, `onClose()` được gọi (đóng modal), màn hình home bị đẩy lên/crop mất phần header — nghi vấn do modal `PinModal` dùng `fixed inset-0` kết hợp bàn phím ảo mobile vừa đóng lại đột ngột, hoặc do input `autoFocus` giữ focus gây trình duyệt tự cuộn theo vị trí input trước đó.
- Yêu cầu: khi modal đóng (`onClose`), đảm bảo vị trí scroll của trang **không đổi** so với ngay trước khi mở modal — có thể cần lưu lại `window.scrollY` lúc mở `PinModal`, và khôi phục lại đúng vị trí đó (hoặc đơn giản là gọi `document.activeElement?.blur()` trước khi đóng modal để trình duyệt không tự cuộn theo bàn phím vừa ẩn đi). Test kỹ trên điện thoại thật (không phải DevTools giả lập) vì hành vi bàn phím ảo khác nhau giữa các trình duyệt mobile.

---

## Việc 5 — Viền cảnh báo khi đang ở Admin Edit Mode

**File:** `src/App.jsx` (hoặc layout ngoài cùng tương đương bọc toàn bộ nội dung)

**Yêu cầu:**
- Khi `isAdminMode === true` (từ `useAdmin()` trong `AdminContext.jsx`), hiển thị viền (border) **tĩnh**, không nhấp nháy/pulse, màu hồng nhạt, độ rộng **5px**, bao quanh toàn bộ khung màn hình.
- Viền phải **cố định (fixed)** theo viewport, giữ nguyên vị trí kể cả khi người dùng cuộn trang — không phải viền của từng card/section riêng lẻ.
- Gợi ý cách làm: một `<div>` overlay `fixed inset-0 pointer-events-none z-[9999] border-[5px] border-pink-200` (hoặc mã màu hồng nhạt cụ thể, ví dụ `#F9C6D3` hay tương đương — chọn tông pastel không đụng với palette navy/gold/skyBlue hiện có để không gây nhầm lẫn với các badge màu khác trong app), render có điều kiện theo `isAdminMode`, đặt ở cấp cao nhất trong `App.jsx` để bọc toàn bộ nội dung.
- Đảm bảo `pointer-events: none` trên lớp viền để không chặn thao tác chạm của người dùng lên nội dung bên dưới.
- Đồng bộ bật/tắt đúng thời điểm vào/thoát Edit Mode — liên quan trực tiếp tới việc 4 (vào Edit ngay sau PIN đúng, không qua bước bấm nút thừa) — nên làm việc 5 SAU việc 4 để tránh phải sửa lại 2 lần cùng khu vực state.

---

## Việc 6 — Đổi màu nền Thông báo khẩn sang tông cảnh báo

**File:** `src/components/AnnouncementsBanner.jsx`, dòng ~48

**Hiện tại:**
```jsx
className="rounded-2xl shadow-sm p-3 bg-[#0B2A4A] text-white flex items-start gap-2"
```

**Yêu cầu:** Đổi `bg-[#0B2A4A]` (navy) sang tông vàng highlight nổi bật — ĐÃ CHỐT mã màu cụ thể (đã thử nhiều phương án khác gồm vàng kem nhạt, hồng nhạt, đỏ nhạt trước khi chốt):
- Nền: `#EF9F27`
- Chữ nội dung: `#412402` (đổi từ `text-white`)
- Không cần thêm viền riêng.
- Icon 📢 giữ nguyên.
- Lưu ý: mã màu này **đậm và khác biệt rõ** so với `badgeGoldBg: #FAEEDA` (màu icon-badge be nhạt đang dùng cho 3 tile Người tham dự/Đêm Gala/Lưu ý di chuyển) — mục đích cố ý để tránh người dùng nhầm lẫn thông báo khẩn với các icon trang trí thông thường.

**Ghi vào `colors.js`** nếu muốn tái sử dụng mã màu này cho các cảnh báo khác sau này, ví dụ thêm:
```js
warningBg: '#EF9F27',
warningText: '#412402',
```
rồi dùng `COLORS.warningBg` thay vì hardcode trực tiếp trong component — tùy Claude Code cân nhắc theo pattern hiện có của file.

**Không đổi** style của nút "Quản lý thông báo" (dòng 36-42, `text-[#3B82C4]`) — chỉ đổi màu nền của banner thông báo đang hiển thị cho người dùng thường.

---

## Việc 7 — Fix màu nền lạc tông trong Ghép phòng (RoomShare)

**File:** `src/components/RoomShare.jsx`, component `MemberRow`, dòng ~35 và ~47

**Bug:** Mỗi khối "tên + phòng ban" của từng thành viên bên trong 1 phòng đang dùng `bg-gray-50` (class Tailwind mặc định, màu xám trắng, không thuộc bảng màu app). Vì `MemberRow` chiếm gần hết bề ngang bên trong `RoomCard`, và mỗi phòng thường có nhiều người xếp chồng dọc, hiện tượng thị giác là **toàn bộ vùng giữa khung phòng** bị trắng/xám lệch tông so với nền kem `#FCFAF5` mà `RoomCard` (card ngoài cùng) đang dùng.

**Yêu cầu fix — có 2 chỗ, cả 2 đều phải sửa:**
- Dòng ~35 (chế độ xem thường):
  ```jsx
  className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5"
  ```
- Dòng ~47 (chế độ admin edit):
  ```jsx
  className="flex items-start gap-2 text-xs bg-gray-50 rounded-lg px-2.5 py-1.5"
  ```

Đổi `bg-gray-50` ở cả 2 chỗ thành một sắc kem cùng tông với `cardBackground: #FCFAF5` nhưng đủ tối hơn một chút để phân biệt được với nền card cha — đề xuất dùng `pageBackground: #F3F1EA` (đã có sẵn trong `colors.js`, dùng cho nền trang, đảm bảo hòa tông kem toàn app):
```jsx
className="flex items-center justify-between text-xs bg-[#F3F1EA] rounded-lg px-2.5 py-1.5"
```
(và tương tự cho dòng admin edit, giữ nguyên phần `flex items-start gap-2` không đổi, chỉ đổi màu nền).

**Không đổi** bất kỳ style nào khác trong file — chỉ đổi đúng 1 class màu nền ở 2 vị trí này.

---

## Việc 8 — Inline hyperlink trong Agenda chi tiết (tính năng mới)

**File chính:** `src/components/Agenda.jsx` — cần thêm 1 hàm parser mới (có thể đặt trong file này hoặc tách file riêng `src/utils/parseInlineLinks.js` nếu muốn gọn).

**Yêu cầu:**
- Hỗ trợ cú pháp Markdown-style `[text hiển thị](url)` trong nội dung field `activity` VÀ `note` (áp dụng cho cả hai, không chỉ activity).
- Viết 1 hàm parser nhẹ, tự viết bằng regex đơn giản (không cần cài thư viện markdown ngoài — ví dụ `react-markdown` là quá nặng cho nhu cầu này), nhận vào chuỗi text, trả về mảng React node: đoạn text thường giữ nguyên, đoạn khớp cú pháp `[text](url)` thì convert thành `<a href={url} target="_blank" rel="noopener noreferrer">text</a>`.
- Regex gợi ý: `/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g` — chỉ nhận `http://` hoặc `https://` để tránh lỗi mở link sai định dạng.
- Style cho thẻ `<a>` được parse ra:
  - Màu chữ: `#185FA5` (đã có sẵn trong `colors.js` với tên `badgeSkyBlueIcon`)
  - `underline` (gạch chân)
  - Phân biệt rõ với text thường xung quanh (hiện `activity` đang màu `#0B2A4A` font-semibold, `note` đang màu `text-gray-500` text-xs)
- Áp dụng parser này ở đoạn hiển thị cho người dùng thường (không phải admin edit) — dòng 193-194 (`row.activity`) và dòng 200 (`row.note`) trong `Agenda.jsx`. Đổi từ:
  ```jsx
  <div className="font-semibold text-[#0B2A4A] whitespace-pre-line">{row.activity}</div>
  ```
  thành gọi hàm parser, ví dụ:
  ```jsx
  <div className="font-semibold text-[#0B2A4A] whitespace-pre-line">{parseInlineLinks(row.activity)}</div>
  ```
  và tương tự cho `row.note`.
- **Giữ nguyên** `whitespace-pre-line` để không phá format xuống dòng hiện có — parser phải trả về mảng node xen kẽ text/link, không phá cấu trúc dòng.
- Phần admin edit (`EditableField` cho `activity`/`note`, dòng 148-161) giữ nguyên là ô nhập text thô — admin gõ trực tiếp cú pháp `[text](url)`. Thêm `placeholder` gợi ý rõ cú pháp, ví dụ:
  - `activity` placeholder: `"Activity, dùng [tên link](url) để chèn link"` (kết hợp cả 2 ngôn ngữ tùy `t()` hiện có)
  - `note` placeholder tương tự.

**Không đụng vào** `mapsUrl` hay `menu` — hai field này đã có cơ chế link riêng, không liên quan tới tính năng inline link mới này.

---

## Checklist trước khi bàn giao

- [ ] `npm run build` chạy không lỗi
- [ ] Test trên điện thoại thật: mở lại app nhiều lần, xác nhận việc 1 hết hiện tượng nháy dữ liệu cũ
- [ ] Test nhập 1 dòng DetailedAgenda mới qua admin, xác nhận ngày/giờ hiển thị đúng "Friday 04/09" / "04:00", không ra ISO timestamp
- [ ] Test tạo 1 Thông báo khẩn mới qua form đã đổi giao diện, xác nhận vẫn tự ẩn sau khi hết `endTime` như trước
- [ ] Test nhập PIN đúng, xác nhận vào Edit ngay không cần bấm thêm, màn hình không bị lệch scroll/zoom
- [ ] Test viền hồng 5px hiển thị đúng khi ở Edit Mode, biến mất khi thoát
- [ ] Test màu nền Thông báo khẩn đã đổi sang tông cảnh báo, đọc rõ chữ
- [ ] Test màn hình Ghép phòng: khối tên+phòng ban trong mỗi phòng đã đổi sang tông kem, không còn trắng/xám lạc tông, kiểm tra cả chế độ xem thường lẫn admin edit
- [ ] Test nhập `[text](url)` vào activity/note qua admin, xác nhận hiển thị thành link màu #185FA5 gạch chân, bấm mở đúng tab mới
