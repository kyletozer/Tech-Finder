'use strict';

(function() {

  let user = {
    position: null,
    getLocation: function(element) {

      return new Promise((resolve, reject) => {

        if(!('geolocation' in navigator)) {
          reject();
        }

        let html = `
          <div class="row">
            <div class="col-sm-6 offset-sm-3">
              <div class="list-group">
                <div class="list-group-item text-center">
                  Gathering user location
                </div>
              </div>
            </div>
          </div>
        `;

        element.html(html).show();

        navigator.geolocation.getCurrentPosition(position => {
          // console.log(position);
          this.position = position;
          resolve();
        }, error => {
          reject(error);
        });
      });
    }
  };

  let app = {
    container: $('#app'),
    results: $('#results'),
    map: $('#map'),
    standby: $('#standby'),
    apiKey: 'xknEGAGSnsMT2j9K9H2RhWAs',

    showErrorPage: function(error) {

      let html = '';

      html += `
        <div class="row">
          <div class="col-sm-6 offset-sm-3">
            <div class="list-group">
              <div class="list-group-item text-center">
                <strong>${error.message}</strong>
                <p>Please enable location and refresh this page.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      this.standby.show().html(html);
    },

    showResults: function(products, term) {

      let html = '';

      if(products.length) {

        products.forEach(product => {

          let image = product.image ? `<img class="card-img-top" src="${product.image}" alt="image for ${product.name}">` : '';

          let online = product.onlineAvailability ? `This item is available online. <a class="btn btn-primary" href="${product.url}">Purchase</a>` : 'This item is not available online.';

          let inStore = product.inStoreAvailability ? `This item is available in store. <button class="find-store btn btn-primary" data-sku="${product.sku}">Find Store</button>` : 'This item is not available in store.';

          html += `
            <div class="row result">
              <div class="col-md-3 result-image">
                ${image}
              </div>
              <div class="col-md-9 result-info">
                <h4 class="card-title">${product.name}</h4>
                <p>${online}</p>
                <p>${inStore}</p>
              </div>
            </div>
          `;
        });

      } else {

        html += `
          <div class="row">
            <div class="col-sm-6 offset-sm-3">
              <div class="list-group">
                <div class="list-group-item text-center">
                  No results for '${term}'.
                </div>
              </div>
            </div>
          </div>
        `;
      }

      this.results.html(html);
    },

    showSearch: function() {
      $('#search').show();
      // $('#search-term').attr('value', 'computers');
    },

    setUpEventHandlers: function(user) {
      // console.log(user);
      var self = this;

      this.container.on('submit', '#search-form', function(e) {
        e.preventDefault();
        let term = $(this).find('[type="search"]').val();
        if(!term) return;
        self.getProducts(term, user.coords.latitude, user.coords.longitude);
      });

      this.container.on('click', '.find-store', function(e) {
        let sku = $(this).attr('data-sku');
        let url = `https://api.bestbuy.com/v1/stores(area(${user.coords.latitude},${user.coords.longitude},10))+products(sku=${sku})`;

        let settings = {
          format: 'json',
          pageSize: 1,
          apiKey: self.apiKey
        };

        $.get(url, settings, function(data, textStatus, jqXHR) {
          console.log(data, textStatus, jqXHR);
          self.showMap(data.stores);
        });
      });

      this.map.on('click', '.close-window', function(e)  {
        $(e.delegateTarget).hide();
      });
    },

    showMap: function(stores) {
      console.log(stores);
      let html = '';

      if(!stores.length) {
        html += `
          <li class="list-group">
            <div class="list-group-item text-center">
              There are no stores within a 10 miles of your current position.
            </div>
          </li>
        `;
      }

      stores.forEach(store => {
        let fullAddress = `${store.address}, ${store.longName}, ${store.region}`;

        html += `
        <li class="list-group-item">
          <p style="float: left;">${fullAddress}</p>
          <p style="float: right;"><a href="https://maps.google.com/?q=Best Buy ${fullAddress}" target="_blank">View map</a></p>
        </li>`;
      });

      html = `
        <div class="container">
          <div class="row">
            <div class="col-sm-6 offset-sm-3">
              <div class="close-window clickable">Back to search</div>
              <ul class="list-group">${html}</ul>
            </div>
          </div>
        </div>
      `;

      this.map.show().html(html);
    },

    getProducts: function(term, latitude, longitude) {

      let formattedTerm = term.split(' ').map(word => {
        return `search=${word}`;
      }).join('&');

      let url = `https://api.bestbuy.com/v1/products(${formattedTerm})`;

      let settings = {
        format: 'json',
        apiKey: this.apiKey,
        // cursorMark: '*'
      };

      var self = this;

      $.get(url, settings, function(data, textStatus, jqXHR) {
        console.log(data, textStatus, jqXHR);
        self.showResults(data.products, term);
      });
    }
  };

  function initApp() {

    // user = {
    //   coords: {
    //     latitude: 44.882942,
    //     longitude: -93.2775
    //   }
    // };

    app.standby.hide();
    app.setUpEventHandlers(user.position);
    app.showSearch();
    // $('#search button').trigger('click');
  }

  user.getLocation(app.standby)
  .then(initApp)
  .catch(error => {
    setTimeout(() => {
      app.showErrorPage(error);
    }, 1000);
  });

  // initApp();

})();
