import { lazy, Suspense, useEffect, useState } from "react";
import { Button, Navbar, Container, Nav, Row, Col } from 'react-bootstrap';
import './App.css';
import bg from './img/bg.png';
import data from './data.js';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios'
import { useQuery } from "react-query";

const Cart = lazy(() => import('./pages/Cart.js'));
const Detail = lazy(() => import('./pages/Detail.js'));

function App() {

  // 최근 본 상품 초기화
  useEffect(() => {
    let a = JSON.parse(localStorage.getItem('watched'))

    if (a == null || a.length === 0) {
      localStorage.setItem('watched', JSON.stringify([]))
    }

  }, [])

  let recentItemId = JSON.parse(localStorage.getItem('watched'))

  // 상품 state
  // data.js 에서 state 초기화
  let [shoes, setShoes] = useState(data)

  let navigate = useNavigate();

  // 더보기 버튼 카운트
  let [btnCount, setBtnCount] = useState(0);

  // 더보기 로딩
  let [loading, setLoading] = useState(false);

  // 서버에서 유저 정보 가져오기
  let user = useQuery('user', () => {
    return axios.get('https://codingapple1.github.io/userdata.json').then((a) => {
      return a.data
    })
  })

  return (
    <div className="App" >

      <Navbar bg="light" data-bs-theme="light">
        <Container>
          <Navbar.Brand href="/">ShoeShop</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link onClick={() => { navigate('/about') }}>회사정보</Nav.Link>
            <Nav.Link onClick={() => { navigate('/cart') }}>장바구니</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {user.isLoading && '로딩중'}
            {user.error && '에러!'}
            {user.data && user.data.name}
          </Nav>
        </Container>
      </Navbar>

      <Suspense fallback={<div>로딩중.......</div>}>
        <Routes>
          <Route path="/" element={<div>
            <div className="main-bg" style={{ backgroundImage: 'url(' + bg + ')' }}></div>

            <Container>
              <Row>
                {
                  shoes.map(function (a, i) {
                    return (
                      <Carditem shoes={shoes[i]} index={i} key={i} navigate={navigate}></Carditem>
                    )
                  })
                }
              </Row>
            </Container>

            {/* 더보기 버튼 처음 누르면 "https://codingapple1.github.io/shop/data2.json", 
            "https://codingapple1.github.io/shop/data2.json" 서버에서 데이터를 가져옴 */}
            {(btnCount < 2)
              ?
              <div>
                {loading && <p>@@ 로딩중입니다 @@</p>}
                <button onClick={() => {
                  setLoading(true);
                  axios.get('https://codingapple1.github.io/shop/data' + (btnCount + 2) + '.json')
                    .then((result) => {
                      setLoading(false);
                      let copy = [...shoes, ...result.data];
                      setShoes(copy);
                      setBtnCount(btnCount + 1);
                    })
                    .catch(() => {
                      setLoading(false);
                      console.log('데이터 가져오기 실패')
                    })
                }}>더보기</button>
              </div>
              : null
            }
          </div>} />

          <Route path="/detail/:id" element={<Detail shoes={shoes} />} />
          <Route path="*" element={<div>없는 페이지입니다.</div>} />
          <Route path="/about" element={<About />} >
            <Route path="member" element={<div> 멤버 페이지입니다. </div>} />
            <Route path="location" element={<div> 위치정보 페이지입니다. </div>} />
          </Route>
          <Route path="/cart" element={<Cart />} />

        </Routes>
      </Suspense>

      <div className="col-md-3 recent-items">
        <h5>최근 본 상품</h5>
        {recentItemId && recentItemId.length > 0 ? (
          <div>
            {recentItemId.map(function (a, i) {
              return (
                <div key={i}>
                  <img src={process.env.PUBLIC_URL + '/img/shoes' + (recentItemId[i] + 1) + '.jpg'} alt={`Shoe ${recentItemId[i] + 1}`} style={{ width: '100%', cursor: 'pointer' }} 
                  onClick={() => { 
                    navigate(`/detail/${recentItemId[i]}`) }} />
                </div>
              );
            })}
          </div>
        ) : (
          <p>최근 본 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function About() {
  return (
    <div>
      <h4>회사 정보 페이지입니다.</h4>
      <Outlet></Outlet>
    </div>
  )
}


function Carditem(props) {
  return (
    <Col md={4} onClick={() => { props.navigate('/detail/' + props.index) }}>
      <img src={process.env.PUBLIC_URL + '/img/shoes' + (props.index + 1) + '.jpg'} width="80%" />
      <h4> {props.shoes.title} </h4>
      <p> {props.shoes.price}원 </p>
    </Col>
  )
}

export default App;
