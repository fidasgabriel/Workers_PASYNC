const foods = [
  {
    name: "Callback Burguer",
    cut: 3,
    cook: 8,
    prepare: 2,
  },
  {
    name: "Null-Burguer (veg)",
    cut: 4,
    cook: 7,
    prepare: 2,
  },
  {
    name: "Crispy Turing",
    cut: 2,
    cook: 10,
    prepare: 1,
  },
  {
    name: "Mongo Melt",
    cut: 1,
    cook: 3,
  },
  {
    name: "Webwrap",
    cut: 4,
    prepare: 2,
  },
  {
    name: "NPM Nuggets",
    cook: 4,
  },
  {
    name: "Float Juice",
    cut: 4,
    prepare: 3,
  },
  {
    name: "Array Apple",
    cut: 4,
    prepare: 3,
  },
  {
    name: "Async Berry",
    cut: 2,
    prepare: 2,
  },
];

const iconNull = "./assets/null-state-icon.svg";
const iconCompleted = "./assets/complete-state-icon.svg";
const iconLoading = "./assets/loading-state-icon.svg";

const handleChangeStatus = (queueItem) => {
  const icon = queueItem.querySelector("img");
  if (!icon) return;

  switch (icon.getAttribute("src")) {
    case iconNull:
      icon.setAttribute("src", iconLoading);
      break;
    case iconLoading:
      icon.setAttribute("src", iconCompleted);
      break;
    case iconCompleted:
      icon.setAttribute("src", iconNull);
      break;
  }
};

let menu = document.getElementById("menu");
let queue = document.getElementById("menu-back");

for (let i = 0; i < foods.length; i++) {
  let itemCont = document.createElement("div");
  let item = document.createElement("span");
  let cancelBtnSpecialist = document.createElement("button");
  let cancelBtnGeneralist = document.createElement("button");
  let orderBtnSpecialist = document.createElement("button");
  let orderBtnGeneralist = document.createElement("button");
  let btnContainer = document.createElement("div");
  let btnOrderContUp = document.createElement("div");
  let btnOrderContBtn = document.createElement("div");

  cancelBtnGeneralist.textContent = "Cancelar generalista";
  cancelBtnSpecialist.textContent = "Cancelar especialista";
  orderBtnGeneralist.textContent = "Pedir generalista";
  orderBtnSpecialist.textContent = "Pedir especialista";
  item.textContent = foods[i].name;

  cancelBtnGeneralist.setAttribute("class", "cancelButton");
  cancelBtnSpecialist.setAttribute("class", "cancelButton");
  orderBtnGeneralist.setAttribute("class", "orderButton");
  orderBtnSpecialist.setAttribute("class", "orderButton");
  btnOrderContUp.setAttribute("class", "flexContBtn");
  btnOrderContBtn.setAttribute("class", "flexContBtn");
  item.setAttribute("class", "food");
  itemCont.setAttribute("class", "foodCont");
  btnContainer.setAttribute("class", "btnContainer");

  btnOrderContUp.append(cancelBtnGeneralist, orderBtnGeneralist);
  btnOrderContBtn.append(cancelBtnSpecialist, orderBtnSpecialist);
  btnContainer.append(btnOrderContUp, btnOrderContBtn);
  itemCont.appendChild(item);
  itemCont.appendChild(btnContainer);
  menu.appendChild(itemCont);

  let statusOnQueue = document.createElement("div");
  statusOnQueue.setAttribute("class", "queue");
  queue.appendChild(statusOnQueue);
  let steps = Object.keys(foods[i]);
  for (const step of steps) {
    if (step !== "name") {
      let queueItem = document.createElement("div");
      let stepName = document.createElement("span");
      let status = document.createElement("span");
      let iconStatus = document.createElement("img");
      iconStatus.setAttribute("src", iconNull);
      stepName.setAttribute("class", "stepName");
      queueItem.setAttribute("class", "queueItem");
      status.appendChild(iconStatus);
      stepName.textContent =
        step == "cut"
          ? "Cortar"
          : step == "cook"
          ? "Grelhar/Fritar"
          : "Montar/Preparar";
      queueItem.appendChild(stepName);
      queueItem.appendChild(status);
      statusOnQueue.appendChild(queueItem);
      queueItem.addEventListener("click", function () {
        handleChangeStatus(queueItem);
      });
    }
  }
}
