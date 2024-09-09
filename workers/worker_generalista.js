//Created by Gabriel Fidalgo
onmessage = (event) => {
  switch (event.data.order) {
    case "cut":
      cut(event.data.food);
      break;
    case "cook":
      cook(event.data.food);
      break;
    case "prepare":
      prepare(event.data.food);
      break;
    case "prepareDrink":
      prepareDrink(event.data.food);
      break;
  }
};

function cut(food) {
  setTimeout(() => {
    postMessage({
      name: "cut",
      foodName: food.name,
      currentStatus:
        food.currentStatus === food.order.length - 1
          ? null
          : food.currentStatus + 1,
    });
  }, food.cut * 1000);
}

function cook(food) {
  setTimeout(() => {
    postMessage({
      foodName: food.name,
      name: "cook",
      currentStatus:
        food.currentStatus === food.order.length - 1
          ? null
          : food.currentStatus + 1,
    });
  }, food.cook * 1000);
}

function prepare(food) {
  setTimeout(() => {
    postMessage({
      foodName: food.name,
      name: "prepare",
      currentStatus:
        food.currentStatus === food.order.length - 1
          ? null
          : food.currentStatus + 1,
    });
  }, food.prepare * 1000);
}

function prepareDrink(food) {
  setTimeout(() => {
    postMessage({
      foodName: food.name,
      name: "prepareDrink",
      currentStatus:
        food.currentStatus === food.order.length - 1
          ? null
          : food.currentStatus + 1,
    });
  }, food.prepareDrink * 1000);
}
