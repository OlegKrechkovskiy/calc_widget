document.addEventListener('DOMContentLoaded', async function () {
  const sliderBlocks = document.querySelectorAll('[data-slider-block]');

  sliderBlocks.forEach((element, index) => {
    const slider = new Slider(element);
    slider.init();
  });
});

class Slider {
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

    this._lisingTerm = 6;

    //Сумма финансирования
    this._fundingAmount = 0;
    //Удорожание
    this._riseInPrice = 0;

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

    this.element.dataset.sum && (this.sum = this.element.dataset.sum);

    this.rangeSlider.addEventListener('input', async () => {
      this.output.textContent = Number(this.rangeSlider.value).toLocaleString('ru-RU') + ' ' + this.unit;
      this.rangeSlider.style.setProperty('--value', this.rangeSlider.value);

      this.element.classList.contains('cost-of-equipment') && this.rerenderAdvance(this.rangeSlider.value);
      this.element.classList.contains('advance-payment') && this.interestCalculation(this, this.rangeSlider.value);
      this.element.classList.contains('leasing-term') && (this.interestCalculation(null, null));
    });
  }

  rerenderAdvance(value) {
    document.querySelector('.advance-payment[data-slider-block]').dataset.sum = value;
    this.interestCalculation(null, null);
  }
  interestCalculation(data, value) {
    let sum = data
      ? data.element.dataset.sum
      : document.querySelector('.advance-payment[data-slider-block]').getAttribute('data-sum');
    value = value || document.querySelector('.advance-payment[data-slider-block] [data-range-slider]').value;
    let percentageAmount = (sum * value) / 100;
    value != 0
      ? ((document.querySelector('.advance-payment[data-slider-block] [data-percent]').style.display = 'inline-block'),
        (document.querySelector('.advance-payment[data-slider-block] [data-percent]').textContent =
          percentageAmount.toLocaleString('ru-RU') + ' ₽'))
      : (document.querySelector('.advance-payment[data-slider-block] [data-percent]').style.display = 'none');

    if (sum && percentageAmount) {
      let fundingAmount = this.fundingAmount(sum, percentageAmount);
      this.riseInPrice(fundingAmount);
    }
  }
  // Сумма финансирования
  fundingAmount(sum, advance_payment) {
    return this._fundingAmount = sum - advance_payment;
  }
  // Удорожание
  riseInPrice(fundingAmount) {
    let leasing= document.querySelector('.leasing-term[data-slider-block] [data-range-slider]').value;
    //Сумма финансирования * (Ставка (13%) / 12) * Срок лизинга
    console.log('%c riseInPrice >> ', 'background:teal;color:white;', (+fundingAmount * 0.13 / 12 * leasing).toLocaleString('ru-RU') + ' ₽');
  }

  amountOfDeals() {
    //Стоимость оборудования + Удорожание
    // 1 400 000 руб. + 227 500 руб. = 1 627 500

  }
}

// document.addEventListener('DOMContentLoaded', async function () {

//   document.querySelectorAll('[data-slider-block]').forEach(element => {
//     initInput(element);

//     element.addEventListener('input', function (e) {
//       let output = e.target.closest('[data-slider-block]').querySelector('[data-output]');
//       output.textContent = e.target.value;
//     })
//   });

//   sizeCalculation();

// });

// async function initInput(element) {
//   const slider = element;
//   // const slider = document.querySelector('[data-slider-block]');
//   const min = +slider.getAttribute('data-min');
//   const max = +slider.getAttribute('data-max');
//   const step = +slider.getAttribute('data-step');
//   const output = slider.querySelector('[data-output]');
//   const minValueElement = slider.querySelector('[data-min-value]');
//   const maxValueElement = slider.querySelector('[data-max-value]');
//   const rangeSlider = slider.querySelector('[data-range-slider]');

//   output.textContent = min;
//   minValueElement.textContent = min + ' ₽';
//   maxValueElement.textContent = max + ' ₽';
//   rangeSlider.setAttribute('max', max);
//   rangeSlider.setAttribute('min', min);
//   rangeSlider.setAttribute('step', step);
//   rangeSlider.value = min.toString();

//   // return rangeSlider;
// }
// function sizeCalculation() {
//   for (let e of document.querySelectorAll('input[type="range"].slider-progress')) {
//     e.style.setProperty('--value', e.value);
//     e.style.setProperty('--min', e.min == '' ? '0' : e.min);
//     e.style.setProperty('--max', e.max == '' ? '100' : e.max);
//     e.addEventListener('input', () => e.style.setProperty('--value', e.value));
//   }
// }
