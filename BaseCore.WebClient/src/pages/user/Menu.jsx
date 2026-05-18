import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { categoryApi, productApi } from '../../services/api';

function Menu() {

  const [sortType, setSortType] = useState("default");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    addToCart,
    totalCartQuantity,
  } = useCart();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate('/login');
  };
  function showToast(message) {
    const toast = document.getElementById("toast");

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000); // 2 giây (đổi 3000 = 3 giây)
  }

  useEffect(() => {
    document.body.classList.add("sub_page");

    return () => {
      document.body.classList.remove("sub_page");
    };

  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gọi API lấy danh sách món ăn từ backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        // Lấy nhiều dữ liệu một lần, sau đó filter/search/sort/pagination ở frontend.
        // Như vậy search trong All/Burger/Pizza... sẽ tìm trên toàn bộ danh sách,
        // không bị giới hạn ở page hiện tại.
        const [response, categoryResponse] = await Promise.all([
          productApi.getAll({
            page: 1,
            pageSize: 1000,
            sortType,
            priceRange: priceRange || undefined,
          }),
          categoryApi.getAll(),
        ]);

        if (false) {
          throw new Error(`API lỗi: ${response.status}`);
        }

        const data = response.data;
        console.log("Products from API:", data);
        console.log("Categories from API:", categoryResponse.data);

        let productList = [];
        const categoryList = Array.isArray(categoryResponse.data) ? categoryResponse.data : [];
        const nextCategoryMap = categoryList.reduce((map, category) => {
          map[String(category.id || category.Id)] = category.name || category.Name || "";
          return map;
        }, {});

        if (Array.isArray(data)) {
          productList = data;
        } else if (Array.isArray(data.data)) {
          productList = data.data;
        } else if (Array.isArray(data.$values)) {
          productList = data.$values;
        } else if (Array.isArray(data.result)) {
          productList = data.result;
        } else if (data.items && Array.isArray(data.items)) {
          productList = data.items;
        } else if (data.products && Array.isArray(data.products)) {
          productList = data.products;
        } else {
          console.error("API trả về Object, không phải Array:", data);
        }

        setCategoryMap(nextCategoryMap);
        setProducts(productList);
      } catch (err) {
        console.error("Lỗi gọi API products:", err);
        setError("Không tải được danh sách món ăn. Hãy kiểm tra backend API.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortType, priceRange]);

  // Lọc sản phẩm theo categoryName trả về từ API
  const safeProducts = Array.isArray(products) ? products : [];

  const getCategoryName = (p) => {
    const categoryId = p.categoryId || p.CategoryId;
    return p.category?.name || p.categoryName || p.CategoryName || categoryMap[String(categoryId)] || "";
  };

  const filteredProducts = safeProducts.filter((p) => {
    const categoryName = getCategoryName(p);
    const productName = p.name || p.Name || "";

    const matchCategory =
      filter === 'all' || categoryName.toLowerCase() === filter.toLowerCase();

    const matchSearch = productName
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());

    return matchCategory && matchSearch;
  });

  const sortedProducts = filteredProducts;

  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const indexOfLastProduct = page * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    setPage(1);
  }, [filter, searchText, sortType, priceRange]);

  const handleSortChange = (type) => {
    setSortType(type);
    setIsSortOpen(false);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    setIsSortOpen(false);
  };
  const getProductImage = (p) => {
    const imageUrl = p.imageUrl || p.ImageUrl;

    if (!imageUrl) {
      const categoryName = getCategoryName(p).toLowerCase();

      if (categoryName === "burger") return "/images/b1.jpg";
      if (categoryName === "pizza") return "/images/f1.png";
      if (categoryName === "pasta") return "/images/f4.png";
      if (categoryName === "fries") return "/images/f5.png";

      return "/images/f1.png";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  };
  return (
      <>
      <div id="toast"></div>

      <div>
        <div className="hero_area">
          <header className="header_section">
            <div className="container">
              <nav className="navbar navbar-expand-lg custom_nav-container ">
                <a className="navbar-brand" href="index.html">
                  <span>
                    JolliVing 🐝
                  </span>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span> </span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav  mx-auto ">
                    <li className="nav-item">
                      <a className="nav-link" href="/">Trang chủ </a>
                    </li>
                    <li className="nav-item active">
                      <a className="nav-link" href="/menu">Thực đơn<span className="sr-only">(current)</span> </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/about">Về JolliVing</a>
                    </li>

                
                    <li className="nav-item">
                      <a className="nav-link" href="/orders">Đơn hàng của tôi</a>
                    </li>
                  </ul>
                  <div className="user_option">
                    <a href="/login"
                      className="user_link"
                      onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {(user?.role || "User").toUpperCase()}
                      </span>
                      <i className="fa fa-user" style={{ color: "white" }} aria-hidden="true" />
                    </a>
                    <div className="cart_link cart-header-link"
                      onClick={() => navigate('/cart')}

                    >
                      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.029 456.029" style={{ enableBackground: 'new 0 0 456.029 456.029' }} xmlSpace="preserve">
                        <g>
                          <g>
                            <path d="M345.6,338.862c-29.184,0-53.248,23.552-53.248,53.248c0,29.184,23.552,53.248,53.248,53.248
              c29.184,0,53.248-23.552,53.248-53.248C398.336,362.926,374.784,338.862,345.6,338.862z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M439.296,84.91c-1.024,0-2.56-0.512-4.096-0.512H112.64l-5.12-34.304C104.448,27.566,84.992,10.67,61.952,10.67H20.48
              C9.216,10.67,0,19.886,0,31.15c0,11.264,9.216,20.48,20.48,20.48h41.472c2.56,0,4.608,2.048,5.12,4.608l31.744,216.064
              c4.096,27.136,27.648,47.616,55.296,47.616h212.992c26.624,0,49.664-18.944,55.296-45.056l33.28-166.4
              C457.728,97.71,450.56,86.958,439.296,84.91z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M215.04,389.55c-1.024-28.16-24.576-50.688-52.736-50.688c-29.696,1.536-52.224,26.112-51.2,55.296
              c1.024,28.16,24.064,50.688,52.224,50.688h1.024C193.536,443.31,216.576,418.734,215.04,389.55z" />
                          </g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                        <g>
                        </g>
                      </svg>

                      {totalCartQuantity > 0 && (
                        <span className="cart-count">{totalCartQuantity}</span>
                      )
                      }
                    </div>

                    <form className="form-inline">
                      <button className="btn  my-2 my-sm-0 nav_search-btn" type="submit">
                        <i className="fa fa-search" aria-hidden="true" />
                      </button>
                    </form>

                  </div>
                </div>
              </nav>
            </div>
          </header>
          {/* end header section */}
        </div>

        {/* food section */}
        <section className="food_section layout_padding">
          <div className="container">
            <div className="heading_container heading_center">
              <h2>
                JolliVing Menu
              </h2>
            </div>
            <div className="menu-toolbar">
              <ul className="filters_menu">

                <li
                  className={filter === "all" ? "active" : ""}
                  onClick={() => {
                    setFilter("all");
                    setPage(1);
                  }}
                >
                  Tất cả
                </li>
                <li
                  className={filter === "burger" ? "active" : ""}
                  onClick={() => {
                    setFilter("burger");
                    setPage(1);
                  }}
                >
                  Burger
                </li>
                <li
                  className={filter === "pizza" ? "active" : ""}
                  onClick={() => {
                    setFilter("pizza");
                    setPage(1);
                  }}
                >
                  Pizza
                </li>
                <li
                  className={filter === "pasta" ? "active" : ""}
                  onClick={() => {
                    setFilter("pasta");
                    setPage(1);
                  }}
                >
                  Mì ý
                </li>
                <li
                  className={filter === "fries" ? "active" : ""}
                  onClick={() => {
                    setFilter("fries");
                    setPage(1);
                  }}
                >
                  Khoai tây chiên
                </li>
              </ul>
              <div className="sort-wrapper" ref={sortRef}>
                <button
                  type="button"
                  className={`sort-btn ${isSortOpen ? "active" : ""}`}
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  aria-expanded={isSortOpen}
                  aria-haspopup="menu"
                >
                  Sort <span className="sort-arrow">▾</span>
                </button>
                {isSortOpen && (
                  <div className="sort-dropdown-menu" role="menu">
                    <div className="sort-dropdown-item sort-has-submenu">
                      <span>Price</span>
                      <span>›</span>
                      <div className="sort-submenu">
                        <button type="button" onClick={() => handlePriceRangeChange("")}>
                          All prices
                        </button>
                        <button type="button" onClick={() => handlePriceRangeChange("under100")}>
                          Under 100k
                        </button>
                        <button type="button" onClick={() => handlePriceRangeChange("100to200")}>
                          100k - 200k
                        </button>
                        <button type="button" onClick={() => handlePriceRangeChange("above200")}>
                          Above 200k
                        </button>

                      </div>
                    </div>

                    <button
                      type="button"
                      className="sort-dropdown-item"
                      onClick={() => handleSortChange("newest")}
                    >
                      Newest
                    </button>
                    <button
                      type="button"
                      className="sort-dropdown-item"
                      onClick={() => handleSortChange("nameAsc")}
                    >
                      Name A-Z
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="menu-search-box">
              <input
                type="text"
                placeholder="Search food by name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              {searchText && (
                <button type="button" onClick={() => setSearchText("")}>×</button>
              )}
            </div>

            <div className="filters-content">
              <div className="row grid">
                {loading && (
                  <div className="col-12 text-center">
                    <p>Đang tải danh sách món ăn...</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="col-12 text-center">
                    <p style={{ color: "red" }}>{error}</p>
                  </div>
                )}

                {!loading && !error && sortedProducts.length === 0 && (
                  <div className="col-12 text-center">
                    <p>Không tìm thấy món ăn phù hợp.</p>
                  </div>
                )}

                {!loading && !error && Array.isArray(currentProducts) && currentProducts.map((p) => (
                  <div
                    className={`col-sm-6 col-lg-4 all ${getCategoryName(p).toLowerCase()}`}
                    key={p.id || p.Id}
                  >
                    <div className="box">
                      <div>
                        <div className="img-box">
                          <img src={getProductImage(p)} alt={p.name || p.Name} />
                        </div>

                        <div className="detail-box">
                          <h5>{p.name || p.Name}</h5>

                          <p>{p.description || p.Description}</p>

                          <div className="options">
                            <h6>
                              {Number(p.price || p.Price).toLocaleString("vi-VN")} đ
                            </h6>

                            <button
                              type="button"
                              className="add-cart-btn"
                              onClick={() => {
                                addToCart(p);
                                showToast("Đã thêm vào giỏ hàng!");
                              }}


                            >
                              <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!loading && !error && sortedProducts.length > 0 && totalPages > 1 && (
              <div className="btn-box d-flex justify-content-center gap 3">
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Prev
                </button>
                <span style={{ padding: " 20px 20px" }}>
                  [Page {page} / {totalPages}]
                </span>
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        {/* end food section */}
        {/* footer section */}
        <footer className="footer_section">
          <div className="container">
            <div className="row">
              <div className="col-md-4 footer-col">
                <div className="footer_contact">
                  <h4>
                    Contact Us
                  </h4>
                  <div className="contact_link_box">
                    <a href="#">
                      <i className="fa fa-map-marker" aria-hidden="true" />
                      <span>
                        Location
                      </span>
                    </a>
                    <a href="#">
                      <i className="fa fa-phone" aria-hidden="true" />
                      <span>
                        Call +01 1234567890
                      </span>
                    </a>
                    <a href="#">
                      <i className="fa fa-envelope" aria-hidden="true" />
                      <span>
                        demo@gmail.com
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-4 footer-col">
                <div className="footer_detail">
                  <a href className="footer-logo">
                    Feane
                  </a>
                  <p>
                    Necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with
                  </p>
                  <div className="footer_social">
                    <a href="#">
                      <i className="fa fa-facebook" aria-hidden="true" />
                    </a>
                    <a href="#">
                      <i className="fa fa-twitter" aria-hidden="true" />
                    </a>
                    <a href="#">
                      <i className="fa fa-linkedin" aria-hidden="true" />
                    </a>
                    <a href="#">
                      <i className="fa fa-instagram" aria-hidden="true" />
                    </a>
                    <a href="#">
                      <i className="fa fa-pinterest" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-4 footer-col">
                <h4>
                  Opening Hours
                </h4>
                <p>
                  Everyday
                </p>
                <p>
                  10.00 Am -10.00 Pm
                </p>
              </div>
            </div>
            <div className="footer-info">
              <p>
                © <span id="displayYear" /> All Rights Reserved By
                <a href="https://html.design/">Free Html Templates</a><br /><br />
                © <span id="displayYear" /> Distributed By
                <a href="https://themewagon.com/" target="_blank">ThemeWagon</a>
              </p>
            </div>
          </div>
        </footer>
        {/* footer section */}
        {/* jQery */}
        {/* popper js */}
        {/* bootstrap js */}
        {/* owl slider */}
        {/* isotope js */}
        {/* nice select */}
        {/* custom js */}
        {/* Google Map */}
        {/* End Google Map */}
      </div>
      </>

  );
  }
  export default Menu;


