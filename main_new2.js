document.addEventListener('DOMContentLoaded', async function () {
  //общий класс для inputs
  class inputRange {
    constructor(element) {
      this.element = element;
      this.min = +this.element.getAttribute('data-min');
      this.max = +this.element.getAttribute('data-max');
      this.step = +this.element.getAttribute('data-step');
      this.unit = this.element.getAttribute('data-unit');
      this.val = this.min;
      this.output = this.element.querySelector('[data-output]');
      this.minValueElement = this.element.querySelector('[data-min-value]');
      this.maxValueElement = this.element.querySelector('[data-max-value]');
      this.rangeSlider = this.element.querySelector('[data-range-slider]');

      this.rangeSlider.style.setProperty('--value', this.min);
      this.rangeSlider.style.setProperty('--min', this.min == '' ? '0' : this.min);
      this.rangeSlider.style.setProperty('--max', this.max == '' ? '100' : this.max);
    }

    init() {
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
  }

  let calcValue = {
    recountVal: 0, // Рассчет процента
    fundingAmount: 0, // Сумма финансирования
    riseInPrice: 0, // Удорожание
    amountDeal: 0, // Сумма договора
    monthlyPayment: 0, // Ежемесячный платёж
    vatSavings: 0, //  Экономия на НДС
    interestExpenses: 0, // Расходы на проценты
    amortization: 0, // Амортизация
    profitTaxSavings: 0, // Экономия на Налог
    totalTaxSavings: 0, // Общая экономия на налогах
    otherCalculations: 0, // Остальные расчёты
    amountOfVatDeducted: 0, // Сумма НДС к вычету
    savingIncomeTaxOwnFunds: 0, // Экономия по налогу на прибыль. Собственные средства.
    savingIncomeTaxCredit: 0, // Экономия по налогу на прибыль. Кредит
  };

  //Вывод Общая экономия на налогах
  const totalTaxSavingsBlock = document.querySelector('[data-total-tax-savings]');
  //Вывод Сумма договора
  const amountOfDealBlock = document.querySelector('[data-amount-deal]');
  // Вывод Ежемесячный платёж
  const monthlyPaymentBlock = document.querySelector('[data-monthly-payment]');

  //Стоимость оборудования
  const costCl = new inputRange(document.querySelector('#cost-of-equipment[data-slider-block]'));
  //Авансовый платёж
  const advanceCl = new inputRange(document.querySelector('#advance-payment[data-slider-block]'));
  //Срок лизинга
  const leasingCl = new inputRange(document.querySelector('#leasing-term[data-slider-block]'));
  costCl.init();
  advanceCl.init();
  leasingCl.init();
  // calculate();

  document.querySelectorAll('[data-range-slider]').forEach(async (element) => {
    element.addEventListener('input', async function () {
      // console.log('%c change value >> ', 'background:teal;color:white;',  costCl.val, advanceBlock.val, leasingBlock.val);

      await calculate();
      await outputOfResults();
      console.log('%c calcValue >> ', 'background:orange;color:black;', calcValue);
    });
  });

  async function calculate() {
    console.log('%c Рассчет ', 'background:black;color:white;');
    await interestCalculation(); //Рассчет процента
    await fundingAmount(); // Сумма финансирования
    await riseInPrice(); // Удорожание
    await amountOfDeal(); // Сумма договора
    await monthlyPayment(); // Ежемесячный платёж
    await vatSavings(); // Экономия на НДС
    await interestExpenses(); // Расходы на проценты
    await amortization(); // Амортизация
    await profitTaxSavings(); // Экономия на налоге на прибыль
    await totalTaxSavings(); // Общая экономия на налогах
    await otherCalculations(); // Остальные расчёты
    await amountOfVatDeducted(); // Сумма НДС к вычету
    await savingIncomeTaxOwnFunds(); // Экономия по налогу на прибыль. Собственные средства.
    await savingIncomeTaxCredit(); // Экономия по налогу на прибыль. Кредит
  }
  // Рассчет процента при изменении суммы
  async function interestCalculation() {
    // console.log('%c Рассчет процента при изменении суммы ', 'background:black;color:white;');

    const sumBlock = document.querySelector('#advance-payment[data-slider-block] [data-percent]');
    const sum = Number((costCl.val / 100) * advanceCl.val);
    calcValue.recountVal = sum;
    sumBlock.textContent = sum.toLocaleString('ru-RU') + ' ₽';
    sum <= 0 ? (sumBlock.style.display = 'none') : (sumBlock.style.display = 'inline-block');
  }
  //Сумма финансирования
  async function fundingAmount() {
    // Стоимость оборудования – Авансовый платёж
    // 1 400 000 руб. – 350 000 руб. = 1 050 000 руб
    calcValue.fundingAmount = +costCl.val - +calcValue.recountVal;
    // console.log('%c Сумма финансирования ', 'background:black;color:white;', calcValue.fundingAmount);
  }
  //Rise in price Удорожание
  async function riseInPrice() {
    //Сумма финансирования * (Ставка (13%) / 12) * Срок лизинга
    // 1 050 000 руб. * 0,13/12 * 20 = 227 500 руб.
    calcValue.riseInPrice = ((+calcValue.fundingAmount * 0.13) / 12) * +leasingCl.val;
    // console.log('%c Удорожание ', 'background:black;color:white;', calcValue.riseInPrice);
  }

  // Сумма договора
  async function amountOfDeal() {
    //Стоимость оборудования + Удорожание
    // 1 400 000 руб. + 227 500 руб. = 1 627 500 руб.
    calcValue.amountDeal = Number((+costCl.val + +calcValue.riseInPrice).toFixed(0));
    // console.log('%c Стоимость оборудования >> ', 'background:black;color:white;', calcValue.amountDeal);
  }
  // Ежемесячный платёж
  async function monthlyPayment() {
    //   (Сумма договора - Авансовый платёж) / Срок лизинга
    // (1 627 500 руб. – 350 000 руб.) / 20 = 63 875 руб.
    calcValue.monthlyPayment = Number(((+calcValue.amountDeal - +calcValue.recountVal) / +leasingCl.val).toFixed(0));
    // console.log('%c Ежемесячный платёж ', 'background:black;color:white;', calcValue.monthlyPayment);
  }
  // Экономия на НДС
  async function vatSavings() {
    // (Стоимость оборудования + Удорожание) / 120 * 20
    // (1 400 000 руб. + 227 500 руб.) / 120 * 20 = 271 250 руб.
    calcValue.vatSavings = Number(((+costCl.val + +calcValue.riseInPrice) / 120) * 20);
    // console.log('%c Экономия на НДС ', 'background:black;color:white;', calcValue.vatSavings);
  }

  // Расходы на проценты
  async function interestExpenses() {
    // Удорожание / 120 * 100
    // (227 500 руб.) / 120 * 100 = 189 583,33 руб
    calcValue.interestExpenses = Number(((+calcValue.riseInPrice / 120) * 100).toFixed(2));
    // console.log('%c Расходы на проценты ', 'background:black;color:white;', calcValue.interestExpenses);
  }
  // Амортизация
  async function amortization() {
    // Стоимость оборудования / 120 * 100 / Срок лизинга * Срок лизинга
    // 1 400 000 руб. / 120 * 100 / 20 * 20 = 1 166 666,66 руб.
    calcValue.amortization = Number(((((+costCl.val / 120) * 100) / +leasingCl.val) * +leasingCl.val).toFixed(2));
    // console.log('%c Амортизация ', 'background:black;color:white;', calcValue.amortization);
  }
  // Экономия на налоге на прибыль
  async function profitTaxSavings() {
    // (Расходы на проценты + Амортизация) * 0,2
    // (189 583,33 руб. + 1 166 666,66 руб.) * 0,2 = 271 250,00 руб
    calcValue.profitTaxSavings = (+calcValue.interestExpenses + +calcValue.amortization) * 0.2;
    // console.log('%c Экономия на налоге на прибыль ', 'background:black;color:white;', calcValue.profitTaxSavings);
  }

  //   Общая экономия на налогах
  async function totalTaxSavings() {
    // (Экономия на НДС + Экономия на налоге на прибыль)
    // 271 250,00 руб. + 271 250,00 руб. = 542 500 руб
    calcValue.totalTaxSavings = Number((+calcValue.vatSavings + +calcValue.profitTaxSavings).toFixed());
    // console.log('%c Общая экономия на налогах ', 'background:black;color:white;', calcValue.totalTaxSavings);
  }
  //   Остальные расчёты
  async function otherCalculations() {
    // Расходы на амортизацию. Собственные средства и кредит
    //   Стоимость оборудования / 120 * 100 / 36 * Срок лизинга
    // 1 400 000 руб. / 120 * 100 / 36 * 20 = 648 148 руб
    calcValue.otherCalculations = Number(((((+costCl.val / 120) * 100) / 36) * +leasingCl.val).toFixed(2));
    // console.log('%c Остальные расчёты ', 'background:black;color:white;', calcValue.otherCalculations);
  }
  // Сумма НДС к вычету
  async function amountOfVatDeducted() {
    //Сумма НДС к вычету. Собственные средства и кредит.
    // принимается к вычету единоразово сразу после приобретения, но только со
    // стоимости оборудования и без учета процентов за финансирование
    // Стоимость оборудования / 120 * 20
    // 1 400 000 руб. / 120 * 20 = 233 333 руб
    calcValue.amountOfVatDeducted = Number(((+costCl.val / 120) * 20).toFixed(0));
    // console.log('%c Сумма НДС к вычету ', 'background:black;color:white;', calcValue.amountOfVatDeducted);
  }
  //Экономия по налогу на прибыль. Собственные средства.
  async function savingIncomeTaxOwnFunds() {
    // Расходы на амортизацию * 20%
    // 648 148 руб. * 20% = 12 096 руб.
    //fixme расходы на амортизацию ??
    // calcValue.savingIncomeTaxOwnFunds = Number((+calcValue.amortization * 0.2).toFixed(0));
    calcValue.savingIncomeTaxOwnFunds = Number((+calcValue.interestExpenses * 0.2).toFixed(0));
    // console.log( '%c Экономия по налогу на прибыль. Собственные средства. ', 'background:black;color:white;', calcValue.savingIncomeTaxOwnFunds );
  }
  // Экономия по налогу на прибыль. Кредит
  async function savingIncomeTaxCredit() {
    // (Расходы на амортизацию + Проценты за финансирование) * 20%
    // ( 648 148 руб. + ( 1 400 000 руб. * 15% / 12 * 20 мес )) * 20%
    //fixme расходы на амортизацию ?? какой брать в расчете ??
    // calcValue.savingIncomeTaxCredit = Number((+calcValue.amortization * 0.2).toFixed(0));
    calcValue.savingIncomeTaxCredit = Number((+calcValue.interestExpenses * 0.2).toFixed(0));
    // console.log( '%c Экономия по налогу на прибыль. Кредит ', 'background:black;color:white;', calcValue.savingIncomeTaxCredit );
  }

  async function outputOfResults() {
    totalTaxSavingsBlock.textContent = 'до ' + calcValue.totalTaxSavings.toLocaleString('ru-RU') + ' ₽';
    amountOfDealBlock.textContent = calcValue.amountDeal.toLocaleString('ru-RU') + ' ₽';
    monthlyPaymentBlock.textContent = 'от ' + calcValue.monthlyPayment.toLocaleString('ru-RU') + ' ₽';
  }
});
