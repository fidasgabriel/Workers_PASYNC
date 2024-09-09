const foods = [
  {
    name: "Callback Burguer",
    cut: 3,
    cook: 8,
    prepare: 2,
    currentStatus: null,
    order: ["cut", "cook", "prepare"],
  },
  {
    name: "Null-Burguer (veg)",
    cut: 4,
    cook: 7,
    prepare: 2,
    currentStatus: null,
    order: ["cut", "cook", "prepare"],
  },
  {
    name: "Crispy Turing",
    cut: 2,
    cook: 10,
    prepare: 1,
    currentStatus: null,
    order: ["cut", "cook", "prepare"],
  },
  {
    name: "Mongo Melt",
    cut: 1,
    cook: 3,
    currentStatus: null,
    order: ["cut", "cook"],
  },
  {
    name: "Webwrap",
    cut: 4,
    prepare: 2,
    currentStatus: null,
    order: ["cut", "prepare"],
  },
  {
    name: "NPM Nuggets",
    cook: 4,
    currentStatus: null,
    order: ["cook"],
  },
  {
    name: "Float Juice",
    cut: 4,
    prepareDrink: 3,
    currentStatus: null,
    order: ["cut", "prepareDrink"],
  },
  {
    name: "Array Apple",
    cut: 4,
    prepareDrink: 3,
    currentStatus: null,
    order: ["cut", "prepareDrink"],
  },
  {
    name: "Async Berry",
    cut: 2,
    prepareDrink: 2,
    currentStatus: null,
    order: ["cut", "prepareDrink"],
  },
];

const iconNull = "./assets/null-state-icon.svg";
const iconCompleted = "./assets/complete-state-icon.svg";
const iconLoading = "./assets/loading-state-icon.svg";
const iconPriorityAc = "./assets/priority.svg";
const iconPriorityNull = "./assets/priority-null.svg";

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

const handleResetAll = (item) => {
  const icon = item.querySelector("img");
  const names = item.getAttribute("id").split(" ");
  const current = foods.filter((e) => e.name.includes(names[0]));
  const timerT = document.getElementById(current[0].name);
  if (!icon) return;

  timerT.textContent = "0s";
  icon.setAttribute("src", iconNull);
  processNextTask();
};

const workerScripts = [
  "/workers/worker_generalista.js",
  "/workers/worker_generalista.js",
  "/workers/worker_generalista.js",
  "/workers/worker_generalista.js",
];

let workers = [];
let taskQueue = [];
let availableWorkers = [];
let allOrderedInProgress = [];

function initializeWorkers() {
  for (let i = 0; i < workerScripts.length; i++) {
    const worker = new Worker(workerScripts[i]);
    worker.status = "available";
    workers.push(worker);
    availableWorkers.push(worker);

    worker.onmessage = function (event) {
      if (event.data.currentStatus === null) {
        worker.status = "available";
        const food = foods.filter((e) => e.name === event.data.foodName);
        setTimeout(() => {
          food[0].order.forEach((e) => {
            const o = document.getElementById(food[0].name + " " + e);
            handleResetAll(o);
          });
        }, 1 * 1000);
      }
      processNextTask();
    };

    worker.onerror = function (error) {
      console.error("Worker error:", error);
      worker.status = "available";
      processNextTask();
    };
  }
}

function addTaskToQueue(task, isPriority) {
  if (isPriority) {
    taskQueue.unshift(task);
  } else {
    taskQueue.push(task);
  }
  const timerT = document.getElementById(task.name);
  timerT.textContent = calculateTime(task) + "s";
  processNextTask();
}

function processNextTask() {
  if (taskQueue.length === 0) return;

  for (let i = 0; i < availableWorkers.length; i++) {
    if (availableWorkers[i].status === "available") {
      let task = taskQueue.shift();
      let worker = availableWorkers.splice(i, 1)[0];
      worker.status = "busy " + task.name;
      const timerT = document.getElementById(task.name);

      if (task.currentStatus == null) {
        task.currentStatus = 0;
      }

      const determineTime = (food) => {
        return food.cook ?? 0 > food.cut ?? 0 ? food.cook : food.cut;
      };
      task.order.forEach((e) => {
        if (e !== "prepare" && e !== "prepareDrink") {
          const current = document.getElementById(task.name + " " + e);
          handleChangeStatus(current);
        }
      });

      let promiseChain = Promise.resolve();

      let stepsToProcess = task.order.filter(
        (e) => e !== "prepare" && e !== "prepareDrink"
      );
      let prepareSteps = task.order.filter(
        (e) => e === "prepare" || e === "prepareDrink"
      );

      const o = document.getElementById("id-" + task.name);

      timerT.textContent = determineTime(task) + "s";
      if (stepsToProcess.length) {
        stepsToProcess.forEach((e) => {
          promiseChain = promiseChain.then(() => {
            return processStep(
              e,
              { ...task, currentStatus: task.order.indexOf(e) },
              worker,
              o
            );
          });
        });
      }

      if (prepareSteps.length) {
        promiseChain = promiseChain.then(() => {
          prepareSteps.forEach((e) => {
            timerT.textContent = task.prepare
              ? task.prepare + "s"
              : task.prepareDrink + "s";
            const d = document.getElementById(task.name + " " + e);
            handleChangeStatus(d);
            return processStep(
              e,
              { ...task, currentStatus: task.order.indexOf(e) },
              worker,
              o
            );
          });
        });
      }
      return;
    }
  }
}

const calculateTime = (time) => {
  const calc = (food) => {
    let cook = food.cook ? food.cook : 0;
    let cut = food.cut ? food.cut : 0;
    let prepare = food.prepare ? food.prepare : 0;
    let prepareDrink = food.prepareDrink ? food.prepareDrink : 0;
    return cook + cut + prepare + prepareDrink;
  };
  if (allOrderedInProgress.length >= 4) {
    let currentFoodTime = -1;
    for (let i = 0; i < allOrderedInProgress.length; i++) {
      const idx = allOrderedInProgress[i];

      const sum = calc(foods[idx]) + calc(time);

      if (currentFoodTime > calc(foods[idx]) || currentFoodTime == -1) {
        currentFoodTime = sum;
      }
      if (taskQueue.length >= 2) {
        for (let i = 0; i < taskQueue.length; i++) {
          currentFoodTime += calc(taskQueue[i]);
        }
      }
    }
    return currentFoodTime;
  }
};

function initialize() {
  let menu = document.getElementById("menu");
  let queue = document.getElementById("menu-back");
  let timer = document.getElementById("menu-timer");

  for (let i = 0; i < foods.length; i++) {
    //MENU - ESQUERDO
    let itemCont = document.createElement("div");
    let item = document.createElement("span");
    let cancelBtnSpecialist = document.createElement("button");
    let cancelBtnGeneralist = document.createElement("button");
    let orderBtnSpecialist = document.createElement("button");
    let orderBtnGeneralist = document.createElement("button");
    let btnContainer = document.createElement("div");
    let btnOrderContUp = document.createElement("div");
    let btnOrderContBtn = document.createElement("div");
    let timeExpect = document.createElement("p");
    let lineTitle = document.getElementById("line");

    cancelBtnGeneralist.textContent = "Cancelar generalista";
    cancelBtnSpecialist.textContent = "Cancelar especialista";
    orderBtnGeneralist.textContent = "Pedir generalista";
    orderBtnSpecialist.textContent = "Pedir especialista";
    const o = availableWorkers.filter((e) => e.status == "available");
    const getText = () => {
      return o.length == 1
        ? "funcionário disponível"
        : "funcionários disponíveis";
    };
    lineTitle.textContent = "Fila (" + o.length + " " + getText() + ")";
    timeExpect.textContent = 0 + "s";
    const iconPriority = document.createElement("img");
    iconPriority.setAttribute("class", "iconPri");
    iconPriority.setAttribute("id", foods[i].name + "-priority");
    item.setAttribute("style", "display: flex;");
    item.textContent = foods[i].name;
    iconPriority.setAttribute("src", iconPriorityNull);
    item.appendChild(iconPriority);

    iconPriority.addEventListener("click", function () {
      if (iconPriority.getAttribute("src") == iconPriorityNull) {
        iconPriority.setAttribute("src", iconPriorityAc);
      } else {
        iconPriority.setAttribute("src", iconPriorityNull);
      }
    });

    cancelBtnGeneralist.setAttribute("class", "cancelButton");
    cancelBtnSpecialist.setAttribute("class", "cancelButton");
    orderBtnGeneralist.setAttribute("class", "orderButton");

    orderBtnSpecialist.setAttribute("class", "orderButton");
    orderBtnGeneralist.setAttribute("id", "id-" + foods[i].name);
    btnOrderContUp.setAttribute("class", "flexContBtn");
    btnOrderContBtn.setAttribute("class", "flexContBtn");
    item.setAttribute("class", "food");
    itemCont.setAttribute("class", "foodCont");
    btnContainer.setAttribute("class", "btnContainer");
    timeExpect.setAttribute("class", "timerText");
    timeExpect.setAttribute("id", foods[i].name);

    btnOrderContUp.append(cancelBtnGeneralist, orderBtnGeneralist);
    btnOrderContBtn.append(cancelBtnSpecialist, orderBtnSpecialist);
    btnContainer.append(btnOrderContUp, btnOrderContBtn);
    itemCont.appendChild(item);
    itemCont.appendChild(btnContainer);
    menu.appendChild(itemCont);
    timer.appendChild(timeExpect);

    //MENU DIREITO
    let statusOnQueue = document.createElement("div");
    statusOnQueue.setAttribute("class", "queue");
    queue.appendChild(statusOnQueue);
    let steps = Object.keys(foods[i]);
    for (const step of steps) {
      if (step !== "name" && step !== "currentStatus" && step !== "order") {
        let queueItem = document.createElement("div");
        let stepName = document.createElement("span");
        let status = document.createElement("span");
        let iconStatus = document.createElement("img");
        iconStatus.setAttribute("src", iconNull);
        stepName.setAttribute("class", "stepName");
        queueItem.setAttribute("class", "queueItem");
        queueItem.setAttribute("id", foods[i].name + " " + step);
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
      }
    }

    orderBtnGeneralist.addEventListener("click", function () {
      orderBtnGeneralist.setAttribute("disabled", true);
      let isPriority = false;
      if (iconPriority.getAttribute("src") === iconPriorityAc) {
        isPriority = true;
      } else {
        isPriority = false;
      }
      callGeneralist(foods[i], orderBtnGeneralist, isPriority);
      iconPriority.setAttribute("src", iconPriorityNull);
      allOrderedInProgress.push(i);
    });

    cancelBtnGeneralist.addEventListener("click", function () {
      orderBtnGeneralist.removeAttribute("disabled");
      let currentWorker = workers.find(
        (e) => e.status == "busy " + foods[i].name
      );
      currentWorker.terminate();
      const newWor = new Worker(workerScripts[i]);
      newWor.status = "available";
      workers.splice(workers.indexOf(currentWorker), 1);
      workers.push(newWor);
      if (newWor.status == "available") {
        availableWorkers.push(newWor);
      }
      const lineT = document.getElementById("line");
      const o = availableWorkers.filter((e) => e.status == "available");
      const getText = () => {
        return o.length == 1
          ? "funcionário disponível"
          : "funcionários disponíveis";
      };
      lineT.textContent = "Fila (" + o.length + " " + getText() + ")";
      foods[i].order.map((e) => {
        const item = document.getElementById(foods[i].name + " " + e);
        handleResetAll(item);
      });
      allOrderedInProgress.splice(i, 1);
    });
  }
}

function callGeneralist(ordered, btn, isPriority) {
  const currentFood = foods.find((e) => e.name == ordered.name);

  const timerT = document.getElementById(currentFood.name);

  const determineTime = (food) =>
    food.cook ?? 0 > food.cut ?? 0 ? food.cook : food.cut;

  if (availableWorkers.length > 0) {
    let availableWorker = availableWorkers.pop();
    availableWorker.status = "busy " + currentFood.name;

    if (currentFood.currentStatus == null) {
      currentFood.currentStatus = 0;
    }

    currentFood.order.forEach((e) => {
      if (e !== "prepare" && e !== "prepareDrink") {
        const current = document.getElementById(currentFood.name + " " + e);
        handleChangeStatus(current);
      }
    });

    let promiseChain = Promise.resolve();

    let stepsToProcess = currentFood.order.filter(
      (e) => e !== "prepare" && e !== "prepareDrink"
    );
    let prepareSteps = currentFood.order.filter(
      (e) => e === "prepare" || e === "prepareDrink"
    );

    timerT.textContent = determineTime(currentFood) + "s";
    stepsToProcess.forEach((e) => {
      promiseChain = promiseChain.then(() => {
        return processStep(
          e,
          { ...currentFood, currentStatus: currentFood.order.indexOf(e) },
          availableWorker,
          btn
        );
      });
    });

    promiseChain = promiseChain.then(() => {
      prepareSteps.forEach((e) => {
        timerT.textContent = currentFood.prepare
          ? currentFood.prepare + "s"
          : currentFood.prepareDrink + "s";
        const d = document.getElementById(currentFood.name + " " + e);
        handleChangeStatus(d);
        return processStep(
          e,
          { ...currentFood, currentStatus: currentFood.order.indexOf(e) },
          availableWorker,
          btn
        );
      });
    });
  } else {
    addTaskToQueue(currentFood, isPriority);
  }
}

function processStep(orderStep, currentFood, availableWorker, btn) {
  return new Promise((resolve, reject) => {
    function onMessage(event) {
      availableWorker.removeEventListener("message", onMessage);
      resolve(event.data);

      if (event.data.currentStatus === null) {
        availableWorker.status = "available";
        const food = foods.filter((e) => e.name === event.data.foodName);
        const timerT = document.getElementById(food[0].name);
        timerT.textContent = "Entregue";
        setTimeout(() => {
          food[0].order.forEach((e) => {
            const o = document.getElementById(food[0].name + " " + e);
            handleResetAll(o);
          });
        }, 1 * 1000);
        if (btn) {
          btn.removeAttribute("disabled");
        }
        availableWorkers.push(availableWorker);
        const idx = foods.indexOf(food);
        allOrderedInProgress.splice(idx, 1);
      }

      const current = document.getElementById(
        currentFood.name + " " + event.data.name
      );
      handleChangeStatus(current);

      const lineT = document.getElementById("line");
      const o = availableWorkers.filter((e) => e.status == "available");
      const getText = () => {
        return o.length == 1
          ? "funcionário disponível"
          : "funcionários disponíveis";
      };
      lineT.textContent = "Fila (" + o.length + " " + getText() + ")";
    }

    function onError(event) {
      availableWorker.removeEventListener("error", onError);
      reject(event);
    }

    availableWorker.addEventListener("message", onMessage);
    availableWorker.addEventListener("error", onError);

    availableWorker.postMessage({ food: currentFood, order: orderStep });
    const lineT = document.getElementById("line");
    const o = availableWorkers.filter((e) => e.status == "available");
    const getText = () => {
      return o.length == 1
        ? "funcionário disponível"
        : "funcionários disponíveis";
    };
    lineT.textContent = "Fila (" + o.length + " " + getText() + ")";
  });
}

initializeWorkers();
initialize();
