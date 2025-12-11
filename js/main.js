'use strict';

/* global Monogatari */
/* global monogatari */

const { $_ready, $_ } = Monogatari;

$_ready(() => {
  monogatari.init('#monogatari').then(() => {
    console.log('Monogatari initialized');
  });
});