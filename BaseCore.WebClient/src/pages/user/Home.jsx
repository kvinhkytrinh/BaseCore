import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import { useState } from 'react';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem("userInfo");
    return saved
      ? JSON.parse(saved)
      : {
        fullName: "",
        phone: "",
        email: "",
        address: "",
      };
  });
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveUserInfo = async (e) => {
    e.preventDefault();
    if (!userInfo.fullName || !userInfo.phone || !userInfo.email || !userInfo.address) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const userId = user?.id || user?.Id || user?.userId || user?.UserId;
      if (userId) {
        await userApi.update(userId, {
          name: userInfo.fullName,
          phone: userInfo.phone,
          email: userInfo.email,
          address: userInfo.address,
        });
      }
    } catch (error) {
      console.error('Failed to save user info to server:', error);
    }

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    alert("User information saved successfully");
    setIsEditingUserInfo(false);
    setIsUserInfoOpen(false);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <>
      <div>
        <div className="hero_area">
          <div className="bg-box">
            <img src="images/hero-bg.jpg" alt />
          </div>
          {/* header section strats */}
          <header className="header_section">
            <div className="container">
              <nav className="navbar navbar-expand-lg custom_nav-container ">
                <a className="navbar-brand" href="index.html">
                  <span>
                    JolliVing 🐝

                  </span>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span className> </span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav  mx-auto ">
                    <li className="nav-item active">
                      <a className="nav-link" href="/">Trang Chủ<span className="sr-only">(current)</span></a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/menu">Thực đơn</a>
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
                    <a className="cart_link" href="#">
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
                    </a>
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
          {/* slider section */}
          <section className="slider_section ">
            <div id="customCarousel1" className="carousel slide" data-ride="carousel">
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="container ">
                    <div className="row">
                      <div className="col-md-7 col-lg-6 ">
                        <div className="detail-box">
                          <h1>
                            KhangVinh FF🔥
                          </h1>
                          <p>
                            Here, we don’t just sell food — we serve happiness! 🍔 A burger might not solve all your problems… but it can definitely make you forget them for a while. Feeling hungry? Don’t overthink it — just hit “Order Now” and let us handle the rest!
                          </p>
                          <div className="btn-box">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="carousel-item ">
                  <div className="container ">
                    <div className="row">
                      <div className="col-md-7 col-lg-6 ">
                        <div className="detail-box">
                          <h1>
                            KhangVinh FF
                          </h1>
                          <p>
                            If you’re reading this, there are only two possibilities: you’re hungry… or really hungry. The good news? You’ve come to the right place! Our food doesn’t just taste good — it’s love at first bite. Don’t hesitate, your stomach is already waiting!
                          </p>
                          <div className="btn-box">

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="container ">
                    <div className="row">
                      <div className="col-md-7 col-lg-6 ">
                        <div className="detail-box">
                          <h1>
                            KhangVinh FF
                          </h1>
                          <p>
                            CLife’s too short to eat bad food. Here, every dish is made to make you say, “Why didn’t I find this place sooner?” 😄 One click and you’ve got a fast, delicious, and satisfying meal. Ready? Let’s order!
                          </p>
                          <div className="btn-box">

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container">
                <ol className="carousel-indicators">
                  <li data-target="#customCarousel1" data-slide-to={0} className="active" />
                  <li data-target="#customCarousel1" data-slide-to={1} />
                  <li data-target="#customCarousel1" data-slide-to={2} />
                </ol>
              </div>
            </div>
          </section>
          {/* end slider section */}
        </div>
        {/* offer section */}
        <section className="offer_section layout_padding-bottom">
          <div className="offer_container">
            <div className="container ">
              <div className="row">
                <div className="col-md-6  ">
                  <div className="box ">
                    <div className="img-box">
                      <img src="images/o1.jpg" alt />
                    </div>
                    <div className="detail-box">
                      <h5>
                        Tasty Thursdays
                      </h5>
                      <h6>
                        <span>20%</span> Off
                      </h6>
                      <a href>
                        Order Now <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.029 456.029" style={{ enableBackground: 'new 0 0 456.029 456.029' }} xmlSpace="preserve">
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
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-md-6  ">
                  <div className="box ">
                    <div className="img-box">
                      <img src="images/o2.jpg" alt />
                    </div>
                    <div className="detail-box">
                      <h5>
                        Pizza Days
                      </h5>
                      <h6>
                        <span>15%</span> Off
                      </h6>
                      <a href>
                        Order Now <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.029 456.029" style={{ enableBackground: 'new 0 0 456.029 456.029' }} xmlSpace="preserve">
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
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end offer section */}
        {/* food section */}
        <section className="food_section layout_padding-bottom">
          <div className="container">
            <div className="heading_container heading_center">
              <h2>
                Our Menu
              </h2>
            </div>
            <ul className="filters_menu">
              <li className="active" data-filter="*">All</li>
              <li data-filter=".burger">Burger</li>
              <li data-filter=".pizza">Pizza</li>
              <li data-filter=".pasta">Pasta</li>
              <li data-filter=".fries">Fries</li>
            </ul>
            <div className="filters-content">
              <div className="row grid">
                <div className="col-sm-6 col-lg-4 all pizza">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f1.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Pizza
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $20
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all burger">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f2.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Burger
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $15
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all pizza">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f3.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Pizza
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $17
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all pasta">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f4.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Pasta
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $18
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all fries">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f5.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          French Fries
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $10
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all pizza">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f6.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Pizza
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $15
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all burger">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f7.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Tasty Burger
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $12
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all burger">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f8.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Tasty Burger
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $14
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 all pasta">
                  <div className="box">
                    <div>
                      <div className="img-box">
                        <img src="images/f9.png" alt />
                      </div>
                      <div className="detail-box">
                        <h5>
                          Delicious Pasta
                        </h5>
                        <p>
                          Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque
                        </p>
                        <div className="options">
                          <h6>
                            $10
                          </h6>
                          <a href>
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
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="btn-box">
              <a href>
                View More
              </a>
            </div>
          </div>
        </section>
        {/* end food section */}
        {/* about section */}
        <section className="about_section layout_padding">
          <div className="container  ">
            <div className="row">
              <div className="col-md-6 ">
                <div className="img-box">
                  <img src="images/about-img.png" alt />
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-box">
                  <div className="heading_container">
                    <h2>
                      We Are Feane
                    </h2>
                  </div>
                  <p>
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration
                    in some form, by injected humour, or randomised words which don't look even slightly believable. If you
                    are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in
                    the middle of text. All
                  </p>
                  <a href>
                    Read More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end about section */}
        {/* book section */}
        <section className="book_section layout_padding">
          <div className="container">
            <div className="heading_container">
              <h2>
                Book A Table
              </h2>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form_container">
                  <form action>
                    <div>
                      <input type="text" className="form-control" placeholder="Your Name" />
                    </div>
                    <div>
                      <input type="text" className="form-control" placeholder="Phone Number" />
                    </div>
                    <div>
                      <input type="email" className="form-control" placeholder="Your Email" />
                    </div>
                    <div>
                      <select className="form-control nice-select wide">
                        <option value disabled selected>
                          How many persons?
                        </option>
                        <option value>
                          2
                        </option>
                        <option value>
                          3
                        </option>
                        <option value>
                          4
                        </option>
                        <option value>
                          5
                        </option>
                      </select>
                    </div>
                    <div>
                      <input type="date" className="form-control" />
                    </div>
                    <div className="btn_box">
                      <button>
                        Book Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-md-6">
                <div className="map_container ">
                  <div id="googleMap" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end book section */}
        {/* client section */}
        <section className="client_section layout_padding-bottom">
          <div className="container">
            <div className="heading_container heading_center psudo_white_primary mb_45">
              <h2>
                What Says Our Customers
              </h2>
            </div>
            <div className="carousel-wrap row ">
              <div className="owl-carousel client_owl-carousel">
                <div className="item">
                  <div className="box">
                    <div className="detail-box">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
                      </p>
                      <h6>
                        Moana Michell
                      </h6>
                      <p>
                        magna aliqua
                      </p>
                    </div>
                    <div className="img-box">
                      <img src="images/client1.jpg" alt className="box-img" />
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="box">
                    <div className="detail-box">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
                      </p>
                      <h6>
                        Mike Hamell
                      </h6>
                      <p>
                        magna aliqua
                      </p>
                    </div>
                    <div className="img-box">
                      <img src="images/client2.jpg" alt className="box-img" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end client section */}
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
                    <a href>
                      <i className="fa fa-map-marker" aria-hidden="true" />
                      <span>
                        Location
                      </span>
                    </a>
                    <a href>
                      <i className="fa fa-phone" aria-hidden="true" />
                      <span>
                        Call +01 1234567890
                      </span>
                    </a>
                    <a href>
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
                    <a href>
                      <i className="fa fa-facebook" aria-hidden="true" />
                    </a>
                    <a href>
                      <i className="fa fa-twitter" aria-hidden="true" />
                    </a>
                    <a href>
                      <i className="fa fa-linkedin" aria-hidden="true" />
                    </a>
                    <a href>
                      <i className="fa fa-instagram" aria-hidden="true" />
                    </a>
                    <a href>
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
        {isUserInfoOpen && (
          <div className="invoice-overlay">
            <div className="invoice-box">
              <div className="invoice-header">
                <h3>Thông tin người dùng</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserInfoOpen(false);
                    setIsEditingUserInfo(false);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveUserInfo}>
                <input
                  className="form-control mb-3"
                  name="fullName"
                  placeholder="Họ tên"
                  value={userInfo.fullName}
                  onChange={handleUserInfoChange}
                  disabled={!isEditingUserInfo}
                />

                <input
                  className="form-control mb-3"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange}
                  disabled={!isEditingUserInfo}
                />

                <input
                  className="form-control mb-3"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  disabled={!isEditingUserInfo}
                />

                <textarea
                  className="form-control mb-3"
                  name="address"
                  placeholder="Địa chỉ giao hàng"
                  value={userInfo.address}
                  onChange={handleUserInfoChange}
                  disabled={!isEditingUserInfo}
                />
                {!isEditingUserInfo && (
                  <button
                    type="button"
                    className="paid-btn1"
                    style={{ marginBottom: "12px" }}
                    onClick={() => setIsEditingUserInfo(true)}
                  >
                    Thay đổi thông tin

                  </button>
                )}

                <button type="submit" className="paid-btn">
                  Lưu thông tin
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

    </>
  );
}
export default Home;
