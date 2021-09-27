fetch(
  // 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni-latest.json'
  'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json'
)
  .then((response) => response.json())
  .then((dati) => {
    // MODAL (spostata per renderla disponibile anche alle schede totali e non solo regioni)
    let modal = document.querySelector('.modal-custom');
    let modalContent = document.querySelector('.modal-custom-content');

    // Ordine dati dall'ultimo aggiornato
    let sorted = dati.reverse();

    // Ultima data caricata
    let lastUpdated = sorted[0].data;

    // Formattazione per mostrare data di ultimo update
    let lastUpdatedFormatted = lastUpdated
      .split('T')[0]
      .split('-')
      .reverse()
      .join('/');

    document.querySelector('#data').innerHTML = lastUpdatedFormatted;

    // Ordinare postivi in ordine decr
    let lastUpdatedData = sorted
      .filter((el) => el.data == lastUpdated)
      .sort((a, b) => b.nuovi_positivi - a.nuovi_positivi);

    // Casi totali
    let totalCases = lastUpdatedData
      .map((el) => el.totale_casi)
      .reduce((t, n) => t + n);
    document.querySelector('#totalCases').innerHTML = totalCases;

    document.querySelector('#timeTotal').addEventListener('click', () => {
      let days = Array.from(new Set(sorted.map((el) => el.data))).reverse();

      let totalsPerDays = days.map((el) => [
        el,
        sorted
          .filter((i) => i.data == el)
          .map((e) => e.nuovi_positivi)
          .reduce((t, n) => t + n),
      ]);
      console.log(totalsPerDays);

      modal.classList.add('active');
      modalContent.innerHTML = `    
      <div class="container my-5 py-5">
        <div class="row">
          <div class="col-12">
           <div id="totalTrend" class="d-flex align-items-end plot">
           </div>
         </div>
        </div>
      </div>
      `;
    });

    // Guariti totali
    let totalRecovered = lastUpdatedData
      .map((el) => el.dimessi_guariti)
      .reduce((t, n) => t + n);
    document.querySelector('#totalRecovered').innerHTML = totalRecovered;

    // Morti totali
    let totalDeath = lastUpdatedData
      .map((el) => el.deceduti)
      .reduce((t, n) => t + n);
    document.querySelector('#totalDeath').innerHTML = totalDeath;

    // Totale Positivi attuali
    let totalPositive = lastUpdatedData
      .map((el) => el.totale_positivi)
      .reduce((t, n) => t + n);
    document.querySelector('#totalPositive').innerHTML = totalPositive;

    // CARD REGIONI & PROGRESS-BAR
    let cardWrapper = document.querySelector('#cardWrapper');

    let progressWrapper = document.querySelector('#progressWrapper');

    let todayMax = Math.max(...lastUpdatedData.map((el) => el.nuovi_positivi));

    lastUpdatedData.forEach((el) => {
      let div = document.createElement('div');
      div.classList.add('col-12', 'col-md-6', 'my-4');
      div.innerHTML = `<div class="card-custom p-3 pb-0 h-100" data-region="${el.denominazione_regione}">
      <p>${el.denominazione_regione}</p>
      <p class="text-end h5 mb-0 text-main">${el.nuovi_positivi}</p>
      </div>
      `;

      cardWrapper.appendChild(div);

      let bar = document.createElement('div');
      bar.classList.add('col-12', 'mb-5');
      bar.innerHTML = `
      <p class="mb-0">${el.denominazione_regione}: ${el.nuovi_positivi}</p>
      <div class="progress rounded-0">
      <div class="progress-bar bg-main" style="width: ${
        (100 * el.nuovi_positivi) / todayMax
      }%"></div>
      </div>
      `;

      progressWrapper.appendChild(bar);
    });

    // MODALS
    document.querySelectorAll('[data-region]').forEach((el) => {
      el.addEventListener('click', () => {
        let region = el.dataset.region;

        modal.classList.add('active');

        let dataAboutRegion = lastUpdatedData.filter(
          (el) => el.denominazione_regione == region
        )[0]; /* Aggiungo [0] perché sono in un array di oggetti e mi serve il primo*/

        modalContent.innerHTML = `
          
          <div class="container">
          <div class="row">
          <div class="col-12">
          <p class="h2 text-main">${dataAboutRegion.denominazione_regione}</p>
          </div>
          <div class="col-12">  
          <p class="lead">Totale casi: ${dataAboutRegion.totale_casi}</p>
          <p class="lead">Nuovi positivi: ${dataAboutRegion.nuovi_positivi}</p>
          <p class="lead">Deceduti: ${dataAboutRegion.deceduti}</p>
          <p class="lead">Dimessi guariti: ${dataAboutRegion.dimessi_guariti}</p>
          <p class="lead">Ricoverati con sintomi: ${dataAboutRegion.ricoverati_con_sintomi}</p>
          </div>
          </div>
          <div class="row scrollable">
          <div class="col-12">
          <p class="mb-0 mt-5 text-main"> Trend nuovi casi</p>
          <div id="trendNew" class="d-flex align-items-end plot">
          </div>
          </div>
          <div class="col-12">
          <p class="mb-0 mt-5 text-main"> Trend decessi</p>
          <div id="trendDeath" class="d-flex align-items-end plot">
          </div>
          </div>
          <div class="col-12">
          <p class="mb-0 mt-5 text-main"> Trend dimessi guariti</p>
          <div id="trendRecovered" class="d-flex align-items-end plot">
          </div>
          </div>
          
          </div>
          </div>
          `;

        let trendData = sorted
          .map((el) => el)
          .reverse()
          .filter((el) => el.denominazione_regione == region)
          .map((el) => [
            el.data,
            el.nuovi_positivi,
            el.deceduti,
            el.dimessi_guariti,
          ]);

        let maxNew = Math.max(...trendData.map((el) => el[1]));

        let maxDeath = Math.max(...trendData.map((el) => el[2]));
        let maxRecovered = Math.max(...trendData.map((el) => el[3]));

        let trendNew = document.querySelector('#trendNew');
        let trendDeath = document.querySelector('#trendDeath');
        let trendRecovered = document.querySelector('#trendRecovered');

        trendData.forEach((el) => {
          let colNew = document.createElement('div');
          colNew.classList.add('d-inline-block', 'pin-new');
          colNew.style.height = `${(70 * el[1]) / maxNew}%`;
          trendNew.appendChild(colNew);

          let colDeath = document.createElement('div');
          colDeath.classList.add('d-inline-block', 'pin-death');
          colDeath.style.height = `${(70 * el[2]) / maxDeath}%`;
          trendDeath.appendChild(colDeath);

          let colRecovered = document.createElement('div');
          colRecovered.classList.add('d-inline-block', 'pin-recovered');
          colRecovered.style.height = `${(70 * el[3]) / maxRecovered}%`;
          trendRecovered.appendChild(colRecovered);
        });
      });
    });

    // REMOVE MODALS
    window.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    // ISTOGRAMMA SINGOLO
    // let trendNew = document.querySelector('#trendNew');

    // let lombardia = sorted
    //   .reverse()
    //   .filter((el) => el.denominazione_regione == 'Lombardia')
    //   .map((el) => [el.data, el.nuovi_positivi]);
    // console.log(lombardia);

    // let maxLombardia = Math.max(...lombardia.map((el) => el[1]));
    // console.log(maxLombardia);

    // lombardia.forEach((el) => {
    //   let col = document.createElement('div');
    //   col.classList.add('d-inline-block', 'bg-primary');
    //   col.style.width = '10px';
    //   col.style.marginRight = '1px';
    //   col.style.height = `${(100 * el[1]) / maxLombardia}%`;

    //   trendNew.appendChild(col);
    // });
  });
