document.addEventListener('DOMContentLoaded', async function () {
  class inputRange {
    constructor(element) {
      this.element = element;
      this.min = +this.element.getAttribute('data-min');
      this.max = +this.element.getAttribute('data-max');
      this.step = +this.element.getAttribute('data-step');
      this.unit = this.element.getAttribute('data-unit');
      this.output = this.element.querySelector('[data-output]');
      this.minValueElement = this.element.querySelector('[data-min-value]');
      this.maxValueElement = this.element.querySelector('[data-max-value]');
      this.rangeSlider = this.element.querySelector('[data-range-slider]');

      this._costVal = this.min;
      this._recountVal = this.min; // Рассчет процента
      this._fundingAmount = 0; // Сумма финансирования
      this._riseInPrice = 0; // Удорожание

      this.rangeSlider.style.setProperty('--value', this.min);
      this.rangeSlider.style.setProperty('--min', this.min == '' ? '0' : this.min);
      this.rangeSlider.style.setProperty('--max', this.max == '' ? '100' : this.max);
    }

    init() {
      console.log('this: ', this);
      this.output.textContent = this.min.toLocaleString('ru-RU') + ' ' + this.unit;
      this.minValueElement.textContent = `${this.min.toLocaleString('ru-RU')} ${this.unit}`;
      this.maxValueElement.textContent = `${this.max.toLocaleString('ru-RU')} ${this.unit}`;
      this.rangeSlider.setAttribute('max', this.max);
      this.rangeSlider.setAttribute('min', this.min);
      this.rangeSlider.setAttribute('step', this.step);
      this.rangeSlider.value = this.min.toString();

      this.rangeSlider.addEventListener('input', async () => {
        this.rangeSlider.style.setProperty('--value', this.rangeSlider.value);
        this.output.textContent = Number(this.rangeSlider.value).toLocaleString('ru-RU') + ' ' + this.unit;
        this.val = this.rangeSlider.value;
      });
    }

    get val() {
      return this.rangeSlider.value;
    }
    set val(value) {
      this.minValueElement = value;
    }
    get recountVal() {
      return this._recountVal;
    }
    set recountVal(value) {
      this._recountVal = value;
    }
    get fundingAmount() {
      return this._fundingAmount;
    }
    set fundingAmount(value) {
      this._fundingAmount = value;
    }
    get riseInPrice() {
      return this._riseInPrice;
    }
    set riseInPrice(value) {
      this._riseInPrice = value;
    }
  }

  const costBlock = document.querySelector('#cost-of-equipment[data-slider-block]');
  const advanceBlock = document.querySelector('#advance-payment[data-slider-block]');
  const leasingBlock = document.querySelector('#leasing-term[data-slider-block]');
  //Стоимость оборудования
  let costCl = new inputRange(costBlock);
  //Авансовый платёж
  let advanceCl = new inputRange(advanceBlock);
  //Срок лизинга
  let leasingCl = new inputRange(leasingBlock);
  costCl.init();
  advanceCl.init();
  leasingCl.init();

  // costBlock.addEventListener('input', async function () {
  //   // console.log('%c val >> ', 'background:teal;color:white;', this.querySelector('[data-range-slider]').value);
  //   console.log('%c costOfEquipment val >> ', 'background:teal;color:white;', cost.val, leasing.val);
  // });

  document.querySelectorAll('[data-range-slider]').forEach(async (element) => {
    console.log('element: ', element);
    element.addEventListener('input', async function () {
      await interestCalculation(costCl.val, advanceCl); //Рассчет процента
      await fundingAmount(costCl, advanceCl); // Сумма финансирования
      await riseInPrice(); // Удорожание
      console.log(
        '%c change value >> ',
        'background:teal;color:white;',
        costCl.val,
        advanceCl.recountVal,
        costCl.fundingAmount,
        leasingCl.riseInPrice
      );
    });
  });

  //Rise in price Удорожание
  async function riseInPrice() {
    console.log('%c Удорожание ', 'background:black;color:white;');
    //Сумма финансирования * (Ставка (13%) / 12) * Срок лизинга
    // 1 050 000 руб. * 0,13/12 * 20 = 227 500 руб.
    leasingCl.riseInPrice = ((+costCl.fundingAmount * 0.13) / 12) * +leasingCl.val;
  }
});

// Рассчет процента при изменении суммы
async function interestCalculation(cost, advanceCl) {
  console.log('%c Рассчет процента при изменении суммы ', 'background:black;color:white;');

  const sumBlock = document.querySelector('#advance-payment[data-slider-block] [data-percent]');
  const sum = Number((cost / 100) * advanceCl.val);
  advanceCl.recountVal = sum;
  sumBlock.textContent = sum.toLocaleString('ru-RU') + ' ₽';
  sum <= 0 ? (sumBlock.style.display = 'none') : (sumBlock.style.display = 'inline-block');
}
//Сумма финансирования
async function fundingAmount(costCl, advanceCl) {
  console.log('%c Сумма финансирования ', 'background:black;color:white;');
  // Стоимость оборудования – Авансовый платёж
  costCl.fundingAmount = +costCl.val - +advanceCl.recountVal;
}
