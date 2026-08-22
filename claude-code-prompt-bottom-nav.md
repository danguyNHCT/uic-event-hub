# Sửa Bottom Nav — Căn giữa, cân đối

## Bối cảnh
Bottom nav hiện tại chỉ có 2 mục Trang chủ (Home) và Liên hệ (Contact), nhưng bố cục chưa cân đối — icon quá to, khoảng cách 2 mục không đều, không có trạng thái "active" rõ ràng.

**QUAN TRỌNG: Không tự ý điều chỉnh chức năng nào khác ngoài phạm vi mô tả dưới đây (không đổi route, không đổi nội dung 2 trang Home/Contact, không đụng vào phần code admin/data layer đã làm ở đợt trước).**

## Yêu cầu cụ thể

Tìm component bottom nav hiện tại (thường là `BottomNav.jsx` hoặc tương đương) và chỉnh sửa CSS/layout theo đúng các điểm sau:

1. **Chia đều 2 bên tuyệt đối**: mỗi mục (Trang chủ / Liên hệ) chiếm chính xác 50% chiều ngang của thanh nav — dùng `flex: 1` cho mỗi mục thay vì `justify-content: space-between` với padding cố định như hiện tại.

2. **Đường phân cách ở giữa**: thêm 1 đường kẻ dọc mảnh (`width: 0.5px`, màu border nhạt hiện có trong theme, ví dụ `border-color` hoặc tương đương đã dùng trong project) ở chính giữa, chiều cao khoảng 60-70% chiều cao thanh nav (không chạm sát trên/dưới), để phân tách rõ 2 mục.

3. **Padding trên-dưới cân đối**: mỗi mục có padding đều nhau phía trên và dưới (ví dụ `padding: 14px 0`), để icon + label nằm giữa theo chiều dọc của thanh nav.

4. **Icon nhỏ lại**: giảm kích thước icon emoji hiện tại (🏠 và ☎️) xuống còn khoảng `font-size: 24px` (thay vì kích thước to hiện tại), giữ nguyên emoji, KHÔNG đổi sang icon khác.

5. **Label rõ ràng hơn**: cỡ chữ label `font-size: 12px`, `font-weight: 500`.

6. **Trạng thái active (mục đang được chọn — dựa theo route hiện tại)**:
   - Thêm 1 dải màu nhỏ phía trên icon của mục đang active: `width: 32px`, `height: 3px`, `border-radius: 0 0 3px 3px`, màu gold đã dùng trong bảng màu project (nếu có biến CSS/Tailwind config sẵn cho màu gold thì dùng biến đó, không hardcode hex nếu project đã có token màu).
   - Label của mục active: màu navy đậm (`#0f1e33` hoặc màu navy chính đã dùng trong theme của project — ưu tiên dùng đúng biến màu đã có sẵn thay vì hardcode nếu tìm thấy).
   - Label của mục KHÔNG active: màu xám nhạt/muted (dùng màu text-muted hiện có trong theme).

7. **Giữ nguyên hành vi chuyển trang khi bấm** — chỉ sửa phần hiển thị/CSS, không đổi logic route.

## Kiểm tra sau khi sửa
- Xem trên nhiều kích thước màn hình điện thoại phổ biến, đảm bảo 2 mục luôn cân đối, không bị lệch dù màn hình rộng/hẹp khác nhau.
- Đảm bảo dải màu gold + label navy chỉ hiện đúng ở mục đang active, tự động chuyển khi người dùng chuyển giữa Trang chủ và Liên hệ.
