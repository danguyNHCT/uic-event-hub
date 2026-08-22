# Bottom Nav — Thu gọn/Ẩn theo ngữ cảnh cuộn trang

## Bối cảnh
Bottom nav hiện tại (2 mục Trang chủ/Liên hệ, đã có icon + text + dải màu vàng cho mục active) đang chiếm khá nhiều diện tích màn hình khi người dùng vào sâu trong các tile nội dung, gây vướng. Cần thêm hành vi thu gọn/ẩn linh hoạt theo từng ngữ cảnh màn hình.

**QUAN TRỌNG: Không tự ý điều chỉnh chức năng nào khác ngoài phạm vi mô tả dưới đây. Không đổi route, không đổi bố cục nội bộ (căn giữa, dải màu vàng, đường phân cách) đã làm ở đợt trước — chỉ thêm hành vi hiện/ẩn/thu gọn theo ngữ cảnh.**

## 3 trạng thái của Bottom Nav

### Trạng thái 1 — Đầy đủ (Full)
- Áp dụng khi: đang ở màn hình Trang chủ (route gốc `/` hoặc tương đương).
- Hiển thị: icon + text + dải màu vàng, y hệt như hiện tại, không đổi gì.

### Trạng thái 2 — Thu gọn (Compact)
- Áp dụng khi: đang ở 1 trong 6 tile nội dung (Chương trình, Người tham dự, Chương trình thể thao, Đêm Gala, Ghép phòng, Lưu ý di chuyển) HOẶC màn Liên hệ, VÀ người dùng đang đứng yên tại vị trí cuộn TRÊN CÙNG hoặc DƯỚI CÙNG của trang đó (không phải giữa chừng).
- Hiển thị: ẨN icon, chỉ giữ lại text (label) + dải màu vàng cho mục active. Chiều cao thanh nav giảm tương ứng với phần icon đã bỏ đi (không để khoảng trống thừa nơi icon từng nằm).
- Padding/margin của text co lại cho hợp lý với thanh nav đã thấp hơn, không để text bị lệch/kênh.

### Trạng thái 3 — Ẩn hoàn toàn (Hidden)
- Áp dụng khi: đang ở 1 trong 6 tile nội dung HOẶC màn Liên hệ, VÀ người dùng đang cuộn/vuốt ở vị trí GIỮA CHỪNG (không phải trên cùng, không phải dưới cùng) của trang.
- Hiển thị: ẩn hoàn toàn thanh Bottom Nav, không chiếm không gian màn hình.

## Logic chuyển trạng thái

- Bottom nav cần biết 2 thông tin: (a) route hiện tại (Trang chủ hay 1 trong 6 tile/Liên hệ), (b) vị trí cuộn của trang hiện tại (đầu trang / cuối trang / giữa chừng).
- Theo dõi vị trí cuộn bằng scroll listener trên container nội dung chính (không phải window nếu app dùng scroll container riêng — kiểm tra cấu trúc hiện tại của project để gắn đúng chỗ).
- Định nghĩa "trên cùng": `scrollTop <= 10px` (cho phép sai số nhỏ). Định nghĩa "dưới cùng": `scrollTop + clientHeight >= scrollHeight - 10px` (cho phép sai số nhỏ). Còn lại là "giữa chừng".
- Khi route là Trang chủ → luôn Trạng thái 1 (Full), bỏ qua vị trí cuộn.
- Khi route là 1 trong 6 tile hoặc Liên hệ:
  - Vị trí cuộn = trên cùng hoặc dưới cùng → Trạng thái 2 (Compact).
  - Vị trí cuộn = giữa chừng → Trạng thái 3 (Hidden).
- Khi chuyển route (ví dụ từ Trang chủ sang 1 tile), reset về đúng trạng thái tương ứng với vị trí cuộn ban đầu của trang mới (thường là trên cùng → Trạng thái 2).

## Hiệu ứng chuyển động

- Mọi thay đổi giữa 3 trạng thái đều có transition mượt, khoảng 200-300ms, dùng CSS transition (không cần thư viện animation ngoài).
- Trạng thái 2 → 3 (ẩn): kết hợp `opacity` fade dần về 0 và `transform: translateY(...)` trượt xuống dưới màn hình.
- Trạng thái 3 → 2 (hiện lại): ngược lại, trượt lên + fade vào.
- Trạng thái 1 ↔ 2 (đổi kích thước do bỏ/thêm icon): transition chiều cao (`height` hoặc dùng `max-height`) mượt, tránh giật cục.
- Debounce/throttle scroll listener hợp lý (ví dụ dùng `requestAnimationFrame` hoặc throttle ~100ms) để tránh giật lag khi cuộn nhanh, đặc biệt trên điện thoại cấu hình thấp.

## Kiểm tra sau khi sửa
- Trang chủ: bottom nav luôn đầy đủ, không đổi dù cuộn (nếu trang chủ có thể cuộn).
- Vào 1 tile bất kỳ, đứng yên đầu trang: thấy Trạng thái 2 (compact, không icon).
- Cuộn xuống giữa chừng: bottom nav biến mất mượt mà.
- Cuộn tới đáy trang: bottom nav hiện lại ở dạng Trạng thái 2.
- Cuộn ngược lên đầu trang: bottom nav vẫn ở Trạng thái 2 khi đã tới đỉnh.
- Quay lại Trang chủ (bấm vào label "Trang chủ" dù đang ở dạng thu gọn): bottom nav trở lại Trạng thái 1 đầy đủ ngay lập tức.
- Test trên cả màn hình có nội dung dài (cuộn được nhiều) lẫn màn hình nội dung ngắn (không đủ cuộn, ví dụ 1 tile ít dữ liệu) — trường hợp nội dung ngắn không đủ để cuộn thì coi như luôn ở trạng thái "trên cùng = dưới cùng", giữ Trạng thái 2 cố định, không cần xử lý trạng thái 3.
