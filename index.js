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
          Gathering user location
        `;

        element.html(html).show();

        navigator.geolocation.getCurrentPosition(position => {
          // console.log(position);
          this.position = position;
          resolve();
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

    showResults: function(products) {

      let html = '';

      products.forEach(product => {

        let image = product.image ? `<img class="card-img-top" src="${product.image}" alt="image for ${product.name}">` : '';

        let online = product.onlineAvailability ? `This item is available online. <a href="${product.url}">Purchase</a>.` : 'This item is not available online.';

        let inStore = product.inStoreAvailability ? `This item is available in store. <span class="find-store clickable" data-sku="${product.sku}">Find Store</span>.` : 'This item is not available in store.';

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
        html += `There are no stores in your area.`;
      }

      stores.forEach(store => {
        let fullAddress = `${store.address}, ${store.longName}, ${store.region}`;

        html += `
        <li class="list-group-item">
          <p style="float: left;">${fullAddress}</p>
          <p style="float: right;"><a href="https://maps.google.com/?q=Best Buy ${fullAddress}">View map</a></p>
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

      term = term.split(' ').map(word => {
        return `search=${word}`;
      }).join('&');

      let url = `https://api.bestbuy.com/v1/products(${term})`;

      let settings = {
        format: 'json',
        apiKey: this.apiKey
      };

      var self = this;

      $.get(url, settings, function(data, textStatus, jqXHR) {
        // console.log(data, textStatus, jqXHR);
        self.showResults(data.products);
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
    // handle error
    console.log(error);
  });

  // initApp();

})();
