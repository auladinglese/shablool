import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import ManageNavbar from '/imports/ui/components/manage-navbar.js';
import TwoLinesChart from '/imports/ui/components/two-lines-chart';

const HistoryPlayer = ({ game }) => (
  <div id="history">
    <div className="row">
      <ManageNavbar />
    </div>
    <div className="row">
      <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xl-2" />

      <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 chart">
        <div className="row">
          <div className="row">
            <h3 className="chart-title">ניקוד</h3>
          </div>
          <TwoLinesChart
            data={game.getPlayerScoreAndAvarageScore(Meteor.userId())}
            dataKeyA="playerScore"
            dataKeyB="avarageScore"
            dataKeyX="questionOrder"
          />
        </div>
      </div>

      <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xl-2" />
    </div>

    <div className="row">
      <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xl-2" />

      <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 chart">
        <div className="row">
          <div className="row">
            <h3 className="chart-title">זמן</h3>
          </div>
          <TwoLinesChart
            data={game.getPlayerTimeAndAvarageTime(Meteor.userId())}
            dataKeyA="playerTime"
            dataKeyB="avarageTime"
            dataKeyX="questionOrder"
          />
        </div>
      </div>

      <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2 col-xl-2" />
    </div>
  </div>
);

HistoryPlayer.propTypes = {
  game: PropTypes.instanceOf(Object).isRequired,
};

export default HistoryPlayer;