module.exports = {

  boot: function () {
    window.app = this;

    this.name = "JS Name";

    window.console.log(window.app);
  }

};

module.exports.boot();
