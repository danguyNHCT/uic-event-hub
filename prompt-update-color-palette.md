# Prompt cho Claude Code — Cập nhật bảng màu & icon toàn app (Company Trip 2026 Quy Nhơn)

## Bối cảnh

Giao diện hiện tại quá đơn điệu: 6 tile trang chủ dùng cùng một khối navy đặc, không phân biệt được nhóm nội dung; badge GROUP 1/GROUP 2 trong trang Chương trình không có màu phân biệt; nền trang toàn bộ đang trắng phẳng, thiếu chiều sâu.

Đây là thay đổi **thuần về màu sắc và icon**, không thay đổi cấu trúc dữ liệu, logic, routing, hay bất kỳ hành vi chức năng nào. Không tự ý điều chỉnh bất kỳ chức năng, layout, hoặc phần nào khác ngoài mô tả dưới đây. Nếu phát hiện xung đột hoặc chỗ nào không rõ áp dụng ra sao, dừng lại và báo cáo trước khi tự quyết định.

## 1. Thêm biến màu mới vào `colors.js`

Thêm các biến màu sau vào file `colors.js` hiện có (giữ nguyên toàn bộ biến cũ, chỉ bổ sung thêm — không đổi tên hay xóa biến đang được dùng ở nơi khác):

```js
// Nền trang (áp dụng toàn app, thay thế nền trắng hiện tại)
pageBackground: '#F3F1EA',

// Tile trang chủ & card nội dung trang con
cardBackground: '#FCFAF5',
cardBorder: '#E3D9B4',

// Icon-badge nhóm 1 (skyBlue) — dùng cho: Chương trình, Chương trình thể thao, Ghép phòng
badgeSkyBlueBg: '#E6F1FB',
badgeSkyBlueIcon: '#185FA5',

// Icon-badge nhóm 2 (gold) — dùng cho: Người tham dự, Đêm Gala, Lưu ý di chuyển
badgeGoldBg: '#FAEEDA',
badgeGoldIcon: '#854F0B',

// Badge GROUP 1 / GROUP 2 trong trang Chương trình
group1Bg: '#E6F1FB',
group1Text: '#185FA5',
group2Bg: '#DDEEF0',
group2Text: '#0F6E56',
```

Header giữ nguyên màu navy đặc hiện có (`#1B2A4A` hoặc biến tương đương đang dùng) — không đổi.

## 2. Nền trang (áp dụng cho MỌI trang)

Đổi nền (background) của toàn bộ các trang sau từ trắng sang `pageBackground` (`#F3F1EA`):
- Trang chủ
- Chương trình (cả 3 tab: Tổng quan, Đợt 1, Đợt 2)
- Người tham dự
- Chương trình thể thao
- Đêm Gala
- Ghép phòng
- Lưu ý di chuyển
- Liên hệ

Header của từng trang **giữ nguyên navy đặc**, không đổi màu. Chỉ phần nền phía dưới header (nơi chứa nội dung) đổi màu.

## 3. Tile trang chủ (6 tile trong mục "Khám phá")

Đổi từ nền navy đặc hiện tại sang:
- Background: `cardBackground` (`#FCFAF5`)
- Border: `1px solid` `cardBorder` (`#E3D9B4`)
- Border-radius giữ nguyên như hiện tại
- Text tên tile: đổi màu chữ sang navy đậm (dùng biến navy hiện có) để đọc rõ trên nền sáng — hiện tại đang là chữ trắng vì nền navy, cần đổi lại

Icon hiện tại đang nằm trong hình tròn màu xám-nâu đục — đổi icon-badge (hình tròn chứa icon) sang 2 tông xoay theo nhóm:

| Tile | Icon-badge |
|---|---|
| Chương trình | `badgeSkyBlueBg` + icon màu `badgeSkyBlueIcon` |
| Chương trình thể thao | `badgeSkyBlueBg` + icon màu `badgeSkyBlueIcon` |
| Ghép phòng | `badgeSkyBlueBg` + icon màu `badgeSkyBlueIcon` |
| Người tham dự | `badgeGoldBg` + icon màu `badgeGoldIcon` |
| Đêm Gala | `badgeGoldBg` + icon màu `badgeGoldIcon` |
| Lưu ý di chuyển | `badgeGoldBg` + icon màu `badgeGoldIcon` |

Giữ nguyên icon hiện có của từng tile (chỉ đổi màu nền badge + màu icon, không đổi icon).

## 4. Card nội dung bên trong các trang con

Áp dụng cho các card đang có nền trắng bên trong: từng ngày trong "Chương trình", từng người trong "Người tham dự", từng cặp phòng trong "Ghép phòng", v.v. — tất cả các card dạng "khối trắng chứa nội dung" trong toàn app.

Đổi:
- Background: `cardBackground` (`#FCFAF5`)
- Border: `1px solid` `cardBorder` (`#E3D9B4`) — nếu card hiện tại đang dùng box-shadow thay vì border, thay box-shadow bằng border mỏng này
- Nội dung chữ bên trong giữ nguyên màu như hiện tại (đã đủ tương phản trên nền kem nhạt)

## 5. Badge GROUP 1 / GROUP 2 (trong trang Chương trình)

Hiện tại badge "GROUP 1" và "GROUP 2" dùng chung một màu xám-navy nhạt, không phân biệt được. Đổi thành:

- **GROUP 1**: background `group1Bg` (`#E6F1FB`), chữ `group1Text` (`#185FA5`)
- **GROUP 2**: background `group2Bg` (`#DDEEF0`), chữ `group2Text` (`#0F6E56`)

Giữ nguyên border-radius, padding, font-size, font-weight của badge như hiện tại — chỉ đổi 2 cặp màu trên.

Lưu ý: đây là 2 tông màu cùng họ "mát" (skyBlue và teal), cùng sắc độ sáng — cố tình tránh dùng cặp màu đối lập (ví dụ gold vs blue) để không tạo cảm giác nhóm này quan trọng hơn nhóm kia.

## 6. Icon bottom nav (Trang chủ, Liên hệ)

Đổi 2 icon ở bottom nav (hiện đang là icon outline đơn sắc) sang kiểu icon-badge tròn cùng hệ với 6 tile trang chủ:
- Trang chủ: icon-badge dùng `badgeSkyBlueBg` + `badgeSkyBlueIcon`
- Liên hệ: icon-badge dùng `badgeGoldBg` + `badgeGoldIcon`

Kích thước icon-badge ở bottom nav nên nhỏ hơn icon-badge ở tile trang chủ (phù hợp không gian bottom nav) — Claude Code tự cân đối kích thước hợp lý, giữ nguyên vị trí căn giữa Home/Contact đã làm ở batch trước.

Trạng thái active (đang ở trang đó) giữ nguyên cách hiển thị hiện tại (gạch chân/dot màu gold phía trên) — chỉ đổi icon, không đổi cơ chế active state.

## Không thay đổi (ngoài phạm vi)

- Không đổi cấu trúc component, routing, hoặc bất kỳ logic nào
- Không đổi font, spacing, layout ngoài những gì mô tả ở trên
- Không đổi màu header navy
- Không đụng đến Admin Mode, Thông báo khẩn, hoặc bất kỳ phần admin-editable nào
- Không đổi tên biến màu cũ đang tồn tại trong `colors.js`, chỉ bổ sung thêm

## Sau khi hoàn thành

Build bằng `npm run build` (không dùng `npm run dev`), kiểm tra kỹ trên điện thoại thật trước khi deploy — đặc biệt kiểm tra độ tương phản chữ trên nền kem mới ở ngoài trời nắng. Báo lại danh sách file đã sửa để review trước khi tôi deploy lên Netlify.
