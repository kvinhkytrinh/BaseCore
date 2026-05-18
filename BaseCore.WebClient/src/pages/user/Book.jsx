import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Book() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = (event) => {
        event.preventDefault();
        logout();
        navigate('/login');
    };

    useEffect(() => {
        document.body.classList.add("sub_page");
        return () => {
          document.body.classList.remove("sub_page");
        };
      },[]);
    return (
        <>
       <div>
  <div className="hero_area">
    
    {/* header section strats */}
    <header className="header_section">
      <div className="container">
        <nav className="navbar navbar-expand-lg custom_nav-container ">
          <a className="navbar-brand" href="index.html">
            <span>
              JolliVing
            </span>
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className> </span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav  mx-auto ">
              <li className="nav-item">
                <a className="nav-link" href="/">Trang Chủ </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/menu">Thực đơn</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">Về JolliVing</a>
              </li>
              
            </ul>
            <div className="user_option">
              <a href="/login"
                className="user_link"
                onClick={handleLogout}
                style={{display:"flex",alignItems:"center", gap:"6px"}}>
                  <span style={{ color: "white", fontWeight: "bold" }}>
                      {(user?.role || "User").toUpperCase()}
                  </span>
                <i className="fa fa-user" style={{color:"white"}} aria-hidden="true" />
              </a>
              <a className="cart_link" href="#">
                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.029 456.029" style={{enableBackground: 'new 0 0 456.029 456.029'}} xmlSpace="preserve">
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
              <a href className="order_online">
                Order Online
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
    {/* end header section */}
  </div>
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
</div>


        </>

    );
}
export default Book;
