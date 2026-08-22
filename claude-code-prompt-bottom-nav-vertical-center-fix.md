# Sửa lỗi: Bottom Nav chưa cân đối theo trục dọc (trên/dưới)

## Vấn đề
Trong file `src/components/BottomNav.jsx`, ở cả 2 trạng thái Full (có icon) và Compact (đã ẩn icon), cụm nội dung mỗi nút (dải màu vàng + icon + text) đang bị lệch lên phía trên, không nằm giữa theo chiều dọc của toàn bộ chiều cao thanh nav. Khoảng trắng phía trên và phía dưới cụm nội dung không bằng nhau.

## Nguyên nhân
Cấu trúc hiện tại xếp 3 phần tử (dải vàng → icon → text) theo `flex-col` liên tục từ trên xuống bên trong `<button>`. Vì dải vàng (`h-[3px]`) nằm ở đầu luồng và có margin riêng, khối nội dung không đối xứng qua tâm dọc dù `<button>` có padding trên-dưới bằng nhau — trọng tâm thị giác bị kéo lên trên.

## Yêu cầu sửa

Trong file `src/components/BottomNav.jsx`, cấu trúc lại mỗi `<button>` như sau:

1. Tách dải màu vàng ra khỏi luồng flex dọc — đặt nó bằng `position: absolute` (`top-0 left-1/2 -translate-x-1/2` hoặc tương đương), gắn cố định vào mép TRÊN của `<button>`, KHÔNG chiếm không gian trong luồng flex chính. `<button>` cha cần `position: relative` để làm điểm neo.

2. Phần còn lại (icon + text) đặt trong 1 container con dùng `flex flex-col items-center justify-center`, và `<button>` cha dùng `flex items-center justify-center` theo chiều dọc — để cụm icon+text này LUÔN tự căn giữa theo đúng tâm dọc thực sự của `<button>`, bất kể đang có icon (Full) hay không (Compact).

3. Giữ nguyên toàn bộ hành vi khác: chiều cao `<button>` vẫn co giãn theo trạng thái (`py-3.5` ↔ `py-2` như hiện tại), transition 250ms giữa các trạng thái vẫn giữ, dải vàng vẫn đổi màu theo `isActive` như cũ, icon vẫn co giãn ẩn/hiện bằng `h-6 opacity-100` ↔ `h-0 opacity-0` như cũ.

4. Kiểm tra kỹ: vì dải vàng giờ là `position: absolute`, đảm bảo `<button>` có đủ `padding-top` để dải vàng không đè lên icon/text bên dưới (dải vàng cao 3px, cần ít nhất khoảng 6-8px đệm phía trên nó).

## Kiểm tra sau khi sửa
- Trạng thái Full (Trang chủ): khoảng trắng phía trên cụm icon+text và phía dưới cụm đó (tính từ mép trên/dưới của `<button>`, không tính dải vàng) phải bằng nhau.
- Trạng thái Compact (trong 1 tile, đứng yên đầu/cuối trang): tương tự, khoảng trắng trên/dưới cụm text phải bằng nhau — dù `<button>` đã thấp hơn so với Full.
- Dải vàng luôn nằm sát mép trên `<button>`, không di chuyển theo icon/text, không bị icon/text đè lên hoặc che khuất.
- Chuyển đổi giữa Full ↔ Compact vẫn mượt mà (transition 250ms), không giật cục khi bố cục thay đổi.
