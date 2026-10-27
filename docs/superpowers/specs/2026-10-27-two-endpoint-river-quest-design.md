# Thiết kế hai endpoint — Hành trình hai dòng sông

## Ý định

Giữ nguyên website học tập hiện tại như một phiên bản ổn định, đồng thời xây dựng một trải nghiệm thứ hai khác biệt rõ rệt, sáng tạo và thu hút học sinh THCS hơn. Hai phiên bản cùng tồn tại trong một repository và được triển khai bởi cùng workflow GitHub Pages.

## Cấu trúc endpoint

- Endpoint hiện tại: `/trennqs/` — tiếp tục dùng các tệp hiện có ở `dist/index.html`, `dist/styles.css`, `dist/app.mjs`; không thay đổi giao diện hoặc hành vi.
- Endpoint mới: `/trennqs/hanh-trinh-hai-dong-song/` — dùng một bộ HTML, CSS và JavaScript riêng dưới `dist/hanh-trinh-hai-dong-song/`.
- Hai endpoint độc lập, không có màn hình buộc người học chọn một trong hai.
- Endpoint mới có thể dùng chung duy nhất ảnh bản đồ gốc tại `dist/assets/ban-do-ai-cap-luong-ha.png`; không sửa hoặc tái tạo ảnh.
- Mọi đường dẫn của endpoint mới phải là đường dẫn tương đối để hoạt động trên GitHub Pages và bản xem trước cục bộ.

## Trải nghiệm endpoint mới

Tên trải nghiệm là “Hành trình hai dòng sông”. Trang đưa người học thẳng vào hoạt động, không có trang bìa và không có tiêu đề khổng lồ trùng với Google Sites.

Ba phần kiến thức trở thành ba chặng liên tục:

1. **Khám phá — Theo dòng nước:** bản đồ gốc ở vị trí trung tâm, hai lựa chọn AI CẬP và LƯỠNG HÀ mở các “mảnh ghép lịch sử”. Bảng thông tin vẫn trình bày vai trò của sông Nin, Ti-grơ và Ơ-phơ-rát, nước, phù sa, nông nghiệp và giao thông.
2. **Kết nối — Ghép dấu vết:** đúng bốn cặp kiến thức theo yêu cầu gốc. Chọn hai thẻ liên tiếp, giữ tiến độ khi sai, có bộ đếm, âm thanh theo ngữ cảnh và nút chơi lại.
3. **Giải thích — Mở khóa lịch sử:** giữ nguyên câu hỏi và ba phương án A/B/C. Chỉ A đúng; B/C có gợi ý và cho chọn lại; kết luận chỉ xuất hiện sau câu trả lời đúng.

Thanh tiến trình ba chặng đặt ở đầu trang và cập nhật theo vị trí cuộn, không khóa nội dung và không bắt buộc hoàn thành chặng trước mới xem chặng sau.

## Hướng thị giác

- Nền sáng: kem ngà và vàng cát rất nhạt, không dùng nền xanh đêm của mockup ban đầu.
- Màu nhấn: xanh sông trong, xanh ngọc, vàng đồng và nâu đất.
- Một đường sông mềm chạy dọc hoặc xuyên qua các chặng, đóng vai trò kết nối thị giác chứ không che nội dung.
- Typography: tiêu đề serif mang sắc thái lịch sử; nội dung sans-serif rõ ràng, phù hợp màn hình và tiếng Việt.
- Bố cục bất đối xứng vừa phải, nhiều khoảng thở, không lặp lại kiểu “ba hộp trắng giống nhau” của phiên bản cũ.
- Không dùng phong cách trò chơi điện tử neon, mascot trẻ con, hiệu ứng chớp hoặc trang trí làm sai lệch bản đồ.

## Hiệu ứng 3D

Hiệu ứng 3D phải nhẹ và phục vụ thứ bậc nội dung:

- Khung bản đồ có nhiều lớp chiều sâu bằng CSS perspective, bóng đổ mềm và lớp “thẻ nhiệm vụ” nổi ở cạnh.
- Thẻ khu vực và thẻ ghép có trạng thái nâng nhẹ khi hover/focus; không xoay quá mức làm khó đọc.
- Chuyển động con trỏ/parallax chỉ áp dụng trên thiết bị có con trỏ chính xác, giới hạn biên độ và không làm thay đổi vị trí vùng bấm.
- Trên thiết bị cảm ứng, dùng hiệu ứng nhấn và chiều sâu tĩnh thay vì bám con trỏ.
- Tôn trọng `prefers-reduced-motion`: tắt parallax, rung và chuyển động không thiết yếu.
- Không dùng WebGL, thư viện 3D hoặc tệp phụ thuộc bên ngoài.

## Âm thanh

Giữ hệ thống âm thanh Web Audio hiện tại nhưng endpoint mới có bộ điều khiển “Âm thanh: Bật/Tắt” dễ hiểu. Âm thanh chỉ phát sau thao tác của người học, gồm ghép đúng, hoàn thành bốn cặp, ghép sai, trắc nghiệm đúng và trắc nghiệm sai. Trạng thái tắt âm chỉ lưu trong phiên trình duyệt, không thu thập dữ liệu.

## Responsive và khả năng tiếp cận

- Desktop ưu tiên bản đồ rộng và bảng nhiệm vụ đặt cạnh.
- Tablet chuyển thành bố cục một cột có các lớp nổi gọn hơn.
- Điện thoại tối thiểu 320 px không tràn ngang toàn trang; riêng bản đồ được phép cuộn trong khung quan sát có hướng dẫn rõ.
- Tất cả điều khiển dùng phần tử button/radio thực, có focus rõ, trạng thái ARIA và vùng chạm tối thiểu khoảng 44 px.
- Nội dung động dùng `aria-live`; màu đúng/sai luôn kèm văn bản hoặc ký hiệu.
- Không thu thập thông tin cá nhân, không đăng nhập và không có liên kết/nút giả.

## Kỹ thuật và triển khai

- Website buildless bằng HTML5, CSS3 và JavaScript ES modules; không thêm dependency runtime.
- Các hàm thuần cho logic ghép đôi, trắc nghiệm và cấu hình âm thanh được kiểm thử bằng Node built-in test runner.
- Thêm kiểm thử xác nhận cả `dist/index.html` và `dist/hanh-trinh-hai-dong-song/index.html` tồn tại, dùng đúng bốn cặp, đúng đáp án A và đường dẫn tài nguyên tương đối hợp lệ.
- Workflow GitHub Pages hiện tại tiếp tục upload toàn bộ `dist/`, do đó tự động xuất bản cả hai endpoint trong cùng artifact.
- Phiên bản Sites hiện có có thể được cập nhật cùng source nếu phù hợp, nhưng cấu trúc URL GitHub Pages là tiêu chuẩn bàn giao chính cho hai endpoint.

## Không thuộc phạm vi

- Không thay đổi nội dung lịch sử cốt lõi hoặc ảnh bản đồ gốc.
- Không thêm tài khoản, bảng xếp hạng, lưu điểm bền vững, backend, analytics hoặc dữ liệu học sinh.
- Không chuyển framework và không thêm trò chơi ngoài ba hoạt động đã thống nhất.

## Tiêu chí hoàn thành

- Endpoint gốc không thay đổi về giao diện và chức năng.
- Endpoint mới tải độc lập tại `/hanh-trinh-hai-dong-song/` và hoạt động với đường dẫn project GitHub Pages.
- Hai bảng thông tin, bốn cặp ghép, phản hồi âm thanh, câu hỏi A/B/C và kết luận đều hoạt động đúng.
- Hiệu ứng 3D nhìn thấy rõ nhưng nhẹ, không cản đọc và tự giảm trên mobile/reduced-motion.
- Không có lỗi JavaScript, lỗi console nghiêm trọng, tràn ngang hoặc tài nguyên 404 trong hai kích thước desktop/mobile được kiểm tra.
