# Báo Cáo & Trả Lời Câu Hỏi Bổ Sung - Buổi 7: BookStore

---

### Câu 1: Cấu trúc điều hướng
**Câu hỏi:** Vì sao `BookDetail` được đăng ký ở Stack mà không đặt trong Tab? Nếu đặt vào Tab thì màn hình sẽ khác đi thế nào?

**Trả lời:**
- `BookDetail` được đăng ký ở Native Stack (cùng cấp với Tabs) để khi người dùng mở chi tiết sách, màn hình này sẽ phủ đè lên toàn bộ màn hình bao gồm cả thanh Bottom Tab Bar, đồng thời tự động có thanh Header với nút quay lại (←).
- Nếu đặt `BookDetail` vào bên trong TabNavigator, nó sẽ trở thành một tab con trong Bottom Tab: thanh Bottom Tab Bar vẫn luôn hiển thị ở đáy màn hình chiếm dụng diện tích, không tự động sinh nút Back điều hướng về lại danh sách sách, và phá vỡ cấu trúc trải nghiệm người dùng tự nhiên của ứng dụng di động.

---

### Câu 2: Redux Toolkit & useMemo
**Câu hỏi:** Trong reducer viết `state.items.push(...)` mà sao state gốc không bị sửa trực tiếp? Thử bỏ `useMemo` trong `useCart`: kết quả hiển thị có đổi không, và có hậu quả gì?

**Trả lời:**
- Redux Toolkit tích hợp sẵn thư viện **Immer**. Khi thao tác trong reducers, `state` truyền vào thực chất là một đối tượng `Draft` (bản nháp proxy); Immer sẽ theo dõi các thay đổi mutating như `.push()`, `.splice()` và tự động tạo ra một bản sao state mới bất biến (immutable) ở phía sau mà không hề làm đột biến (mutate) state gốc ban đầu.
- Nếu bỏ `useMemo` trong hook `useCart`, kết quả tính toán (`totalQuantity`, `totalPrice`) hiển thị trên giao diện vẫn hoàn toàn chính xác. Tuy nhiên, hậu quả là hàm `reduce` sẽ phải chạy lại ở mỗi lần component cha hoặc bất kỳ component nào gọi hook này re-render (ngay cả khi giỏ hàng không hề thay đổi), làm giảm hiệu năng xử lý đặc biệt khi danh sách sản phẩm lớn.

---

### Câu 3: Promise.all & Xử lý lỗi API
**Câu hỏi:** Nếu `getCategories()` lỗi còn `getBooks()` thành công thì Home hiện gì? Tìm cách để vẫn hiện được danh sách sách (gợi ý: `Promise.allSettled`) và nói rõ cách đó phải đánh đổi gì.

**Trả lời:**
- Khi dùng `Promise.all([getBooks(), getCategories()])`, theo cơ chế fail-fast, nếu `getCategories()` bị lỗi thì toàn bộ Promise sẽ bị reject ngay lập tức, rơi vào khối `catch`, và màn hình Home sẽ chỉ hiển thị `ErrorView` kèm thông báo lỗi dù danh sách sách đã được tải về thành công.
- Để khắc phục và vẫn hiển thị danh sách sách, ta có thể thay thế bằng `Promise.allSettled([getBooks(), getCategories()])`. Khi đó, ta duyệt qua kết quả của từng promise: nếu `getBooks()` fulfilled thì gán `books`, nếu `getCategories()` rejected thì chỉ báo lỗi nhẹ ở phần danh mục hoặc gán danh mục rỗng `[]`.
- **Đánh đổi:** Ta phải viết thêm code kiểm tra trạng thái (`status === "fulfilled"` / `"rejected"`) cho từng kết quả, xử lý giao diện phân mảnh (màn hình hiển thị một phần dữ liệu, thiếu chip danh mục hoặc người dùng không lọc được danh mục), và cần logic thông báo lỗi riêng cho từng phần thay vì một màn hình lỗi tổng thể duy nhất.

---

### Câu 4: Debounce trong tìm kiếm
**Câu hỏi:** Vì sao không đặt `setTimeout` thẳng trong `onChangeText`? Hàm dọn dẹp (`return () => clearTimeout`) giúp tránh lỗi gì?

**Trả lời:**
- Nếu đặt `setTimeout` trực tiếp trong `onChangeText`, mỗi lần người dùng nhấn một phím sẽ khởi tạo một timer độc lập mà không bị hủy khi người dùng gõ ký tự kế tiếp; kết quả là chuỗi thao tác lọc vẫn bị kích hoạt nhiều lần (chỉ là bị trễ đi) thay vì gộp lại thành một lần sau khi người dùng ngừng gõ.
- Hàm dọn dẹp (`return () => clearTimeout(timer)`) trong `useEffect` giúp:
  1. Hủy bỏ timer đang chờ của lần gõ phím ngay trước đó, đảm bảo chỉ có lần gõ phím cuối cùng sau khoảng thời gian `delay` mới kích hoạt cập nhật state tìm kiếm.
  2. Tránh memory leak và lỗi cập nhật state trên unmounted component khi người dùng rời khỏi màn hình trước khi timer hoàn thành.

---

### Câu 5: Code bổ sung — Tùy chọn sắp xếp “Giá tăng dần / giảm dần” cho Home
**Câu hỏi:** Thêm tuỳ chọn sắp xếp “Giá tăng dần / giảm dần” cho Home. Chỉ cần thêm một state và sửa một chỗ trong `visibleBooks`.

**Đoạn code bổ sung:**

```tsx
// 1. Khai báo kiểu và thêm state lựa chọn sắp xếp trong HomeScreen:
type SortOption = "asc" | "desc" | null;
const [sortOrder, setSortOrder] = useState<SortOption>(null);

// 2. Cập nhật useMemo của visibleBooks để sắp xếp sau khi lọc:
const visibleBooks = useMemo(() => {
  const filtered = filterBooks(books, {
    keyword: debouncedKeyword,
    categoryId,
    priceRange,
  });

  if (!sortOrder) return filtered;

  return [...filtered].sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  );
}, [books, debouncedKeyword, categoryId, priceRange, sortOrder]);

// 3. UI nút chuyển đổi sắp xếp (có thể đặt cạnh bộ lọc hoặc trong header):
// <Pressable onPress={() => setSortOrder(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}>
//   <Text>{sortOrder === "asc" ? "Giá: Thấp → Cao" : sortOrder === "desc" ? "Giá: Cao → Thấp" : "Sắp xếp giá"}</Text>
// </Pressable>
```
