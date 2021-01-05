window.addEventListener("load", () => {
    $.getJSON("./resources/store.json", (data) => {
        let app = new App(data);
    });
});

class App {
    constructor(list) {
        this.list = list;
        this.cartList = [];
        this.item_sum = 0;
        this.price = 0;
        this.product = [];
        this.main();
    }

    main() {
        this.list.forEach((x) => {
            let product = this.item_form(x);
            document.querySelector("#store_form").appendChild(product);

            $(".item-form").draggable({
                containment: "body",
                cancel: ".item-text-box",
                cursor: "pointer",
                helper: "clone",
                revert: true,
                zIndex: 2,
                drag() {
                    $(".drop_cart").css("width", "300px");
                    $(".drop_cart").css("height", "300px");

                },

                stop() {
                    $(".drop_cart").css("width", "150px");
                    $(".drop_cart").css("height", "200px");
                }
            });

            $(".drop_cart").droppable({
                accept: ".item-form",
                drop: (event, ui) => {
                    let id = ui.draggable[0].dataset.id;
                    let item = this.list[id - 1];

                    //장바구니 중복검사 프로세스
                    if (this.cartList.length == 0) {
                        this.cartList.push(id);
                        document.querySelector(".cart_content").appendChild(this.cart_form(item));
                    } else {
                        for (let i = 0; i <= this.cartList.length; i++) {
                            if (id == this.cartList[i]) {
                                alert("이미 장바구니에 담긴 상품입니다.");
                                return;
                            }
                        }

                        this.cartList.push(id);
                        document.querySelector(".cart_content").appendChild(this.cart_form(item));
                    }
                }
            });
        });

        //구매하기 버튼 프로세스
        document.querySelector(".shipping_cart_detail > button").addEventListener("click", () => {
            if (this.cartList.length == 0) {
                alert("장바구니가 비어있습니다.\n쇼핑을 시작하세요!");
                return;
            }

            $(".buy_box").fadeIn();
        });
    }

    //상품 목록 폼
    item_form(data) {
        let div = document.createElement("div");
        div.classList.add("item-form");
        div.dataset.id = data.id;
        div.innerHTML =
            `
            <div class="item">
                <img src="./resources/b_img/${data.photo}" alt="item" data-id="${data.id}" data-name="${data.product_name}" data-brand="${data.brand}" data-price="${data.price}" class="item_img" draggable="false">
                <div class="item-text-box">
                    <input type="hidden" value="${data.id}" name="item_id">
                    <h5>${data.product_name}</h5>
                    <hr style="margin:0;">
                    <p>${data.brand}</p>
                    <p>￦${data.price}</p>
                </div>
            </div>
        `;
        return div;
    }

    //장바구니 폼
    cart_form(data) {     
        this.product.push(data);
        console.log(this.product);
        let div = document.createElement("div");
        div.classList.add("cart_unit");
        div.dataset.id = data.id;
        div.innerHTML =
            `
            <img src="resources/b_img/${data.photo}" alt="img" class="cart_unit_img">
            <div class="cart_unit_info">
                <p>${data.product_name}</p>
                <p>${data.brand}</p>
                <input type="text" class="cart_price" style="background: none; border: none;" value="￦${data.price}" readonly>
            </div>

            <div class="cart_unit_pay_cnt" style="display: flex; align-items: center;">
                수량 :
                <input type="number" min="1" max="999" maxlength="3" value="1" class="cart_unit_pay_cnt_input" style="text-align: center; margin: 10px;">
            </div>

            <div class="cart_unit_pay" style="display: flex; align-items: center;">
                합계 : <input type="text" style="margin: 3px; background: none; border: none; width: 90px; text-align: center; outline: none;" value="${data.price}" readonly>원
            </div>

            <div class="cart_unit_delete">
                <button class="btn btn-danger">삭제</button>
            </div>
        `;

        //폼 이벤트 처리 ( 장바구니 프로세스 )
        let cart_btn = document.querySelector(".drop_cart > button");

        cart_btn.addEventListener("click", (e) => {
            console.log(this.cartList);
            this.price = 0;

            this.item_sum = `${data.price}`.replace(/[,]/g, "") * div.querySelector(".cart_unit_pay_cnt_input").value;

            div.querySelector(".cart_unit_pay > input").value = this.item_sum.toLocaleString();

            let payDOM = document.querySelectorAll(".cart_unit_pay > input");

            payDOM.forEach(e => {
                this.price += (e.value.replace(/[,]/g, "") * 1);
            });

            document.querySelector(".cart_all_pay").innerHTML = "총합계 : " + this.price.toLocaleString() + "원";

            //인풋 이벤트 처리
            div.addEventListener("input", () => {
                if (div.querySelector(".cart_unit_pay_cnt_input").value <= 0) {
                    alert("수량은 최소 1개 부터입니다.");
                    div.querySelector(".cart_unit_pay_cnt_input").value = 1;
                    return;
                }

                if (div.querySelector(".cart_unit_pay_cnt_input").value > 999) {
                    alert("수량은 최대 1000개 까지만 가능합니다.");
                    div.querySelector(".cart_unit_pay_cnt_input").value = 999;
                    return;
                }

                this.price = 0;
                this.item_sum = `${data.price}`.replace(/[,]/g, "") * div.querySelector(".cart_unit_pay_cnt_input").value;

                div.querySelector(".cart_unit_pay > input").value = this.item_sum.toLocaleString();

                let payDOM = document.querySelectorAll(".cart_unit_pay > input");

                payDOM.forEach(e => {
                    this.price += (e.value.replace(/[,]/g, "") * 1);
                });

                document.querySelector(".cart_all_pay").innerHTML = "총합계 : " + this.price.toLocaleString() + "원";
            });
        });

        //장바구니 삭제 프로세스
        div.querySelector(".cart_unit_delete").addEventListener("click", () => {
            if (confirm("정말 삭제하시겠습니까?") == true) {
                div.remove();

                for (let i = 0; i <= this.cartList.length; i++) {
                    if (`${data.id}` == this.cartList[i]) {
                        this.cartList.splice(i, 1);
                    }
                }
                this.price = 0;

                let payDOM = document.querySelectorAll(".cart_unit_pay > input");

                payDOM.forEach(e => {
                    this.price += (e.value.replace(/[,]/g, "") * 1);
                });

                document.querySelector(".cart_all_pay").innerHTML = "총합계 : " + this.price.toLocaleString() + "원";
            }
        });

        //구매하기 창 닫기 프로세스
        document.querySelector(".buy_box_close_button").addEventListener("click", () => {
            $(".buy_box").fadeOut();
            //구매하기 폼 초기화
            document.querySelector("#name").value = "";
            document.querySelector("#address").value = "";

        });

        //구매 완료 버튼 프로세스
        document.querySelector(".buy_box button").addEventListener("click", (e) => {
            let name = document.querySelector("#name");
            let address = document.querySelector("#address");

            // if (!name.value) {
            //     $(name).css("border", "2px solid red");
            // } else {
            //     $(name).css("border", "1px solid #a9a9a9");
            // }

            // if (!address.value) {
            //     $(address).css("border", "2px solid red");
            // } else {
            //     $(address).css("border", "1px solid #a9a9a9");
            // }

            // if (!name.value || !address.value) {
            //     alert("누락된 항목이 있습니다.");
            //     return;
            // }

            //구매하기 폼 초기화
            document.querySelector("#name").value = "";
            document.querySelector("#address").value = "";

            let date = new Date();
            let nowDateForm = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            // alert("성공적으로 구매가 완료되었습니다.");

            $(".shipping_cart").hide();
            $(".buy_box").fadeOut();

            let temp;

            // 영수증 폼
            this.product.forEach((x) => {
                document.querySelector(".buyedPro").appendChild(this.buyedForm(x));
            });

            $(".buyed_box").fadeIn();

            //장바구니 초기화
            let cart = document.querySelectorAll(".cart_unit");
            cart.forEach((e) => {
                e.remove();
                this.price = 0;
            });

            this.cartList = [];

            //영수증 창 닫기 프로세스
            document.querySelector(".buyed_box_close_button").addEventListener("click", () => {
                $(".buyed_box").fadeOut();
                $(".buyedProcess").remove();
            });
        });

        return div;
    }

    buyedForm(data) {
        //영수증 폼 생성
        let div = document.createElement("div");
        div.classList.add("buyedProcess");
        div.innerHTML =
            `
        <p>상품명 : <span id="buyed_name">${data.product_name}</span> 가격 : <span id="buyed_price">${data.price}</span> 수량 : <span id="buyed_cnt">${data.cnt}</span> 합계 : <span id="buyed_sum">${data.sum}</span></p>
        `;

        return div;
    }
}