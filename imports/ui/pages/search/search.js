import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import SweetAlert from 'sweetalert-react';
import 'sweetalert/dist/sweetalert.css';
import Quiz from '/imports/api/quizes/quizes.js';
import QuizCard from '/imports/ui/components/quiz-card.js';
import Loading from '/imports/ui/components/loading';
import InfiniteScroll from 'react-infinite-scroller';

const LoaderAndUI = ({ results, loading, query, state, actions, actionsForUI }) => {
  if (results.length === 0 && loading) return <Loading />;
  return results.length === 0
        ? <div className="row">
          <img
            className="col-md-6"
            src="/img/no-search-results.png"
            alt="No Search Results"
          />
          <img
            className="col-md-6"
            src="/img/no-search-results-text.png"
            alt="No Search Results"
          />
        </div>
        : <div id="search">
          <h1>תוצאות חיפוש עבור <strong>{query}</strong></h1>
          <InfiniteScroll
            loadMore={actionsForUI.MoreQuizzesToDisplay}
            hasMore={!(results.length < state.quizzesToDisplay)}
            loader={<Loading />}
          >
            {results.map(quiz => (
              <div key={quiz._id}>
                <div className="row">
                  <QuizCard quiz={quiz} actions={actions} />
                </div>
              </div>
          ))}
          </InfiniteScroll>
          <div
            id="snackbar"
            className={
                state.quizDeleted || state.quizForked ? 'show' : ''
              }
          >
            {state.quizDeleted
                ? 'השאלון נמחק בהצלחה'
                : 'השאלון הועתק בהצלחה'}
          </div>
          <div
            className={
              results.length < state.quizzesToDisplay ? 'show infinite-scroll-text' : ''
              }
          >
            { 'אין עוד שאלונים להצגה' }
          </div>
          <SweetAlert
            show={state.showDeleteQuizAlert}
            title="מחיקת שאלון"
            type="warning"
            text={
                state.showDeleteQuizAlert
                  ? `האם אתה בטוח שברצונך למחוק את השאלון: ${state.quizToDelete.title}?`
                  : ''
              }
            showCancelButton
            confirmButtonText="מחק!"
            cancelButtonText="בטל"
            onConfirm={() => {
              actionsForUI.deleteQuiz();
              actionsForUI.ConfirmOrCancel();
            }}
            onCancel={actionsForUI.ConfirmOrCancel}
            onEscapeKey={actionsForUI.RemoveQuizAlert}
            onOutsideClick={actionsForUI.RemoveQuizAlert}
          />
        </div>;
};

LoaderAndUI.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  state: PropTypes.instanceOf(Object).isRequired,
  actionsForUI: PropTypes.instanceOf(Object).isRequired,
  actions: PropTypes.instanceOf(Object).isRequired,
};

const DBProvider = createContainer(({ query, state, actions, actionsForUI }) => {
  const searchHandle = Meteor.subscribe('quizes.search', query, state.quizzesToDisplay);
  const loading = !searchHandle.ready();
  const results = Quiz.find().fetch();
  return {
    results,
    loading,
    query,
    state,
    actions,
    actionsForUI,
  };
}, LoaderAndUI);

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quizDeleted: false,
      quizForked: false,
      showDeleteQuizAlert: false,
      quizToDelete: null,
      quizzesToDisplay: 10,
      formerQuery: null,
    };
  }
  componentDidUpdate() {
    const { query } = this.props;
    const newQuery = () => {
      this.setState({ quizzesToDisplay: 10 });
      this.setState({ formerQuery: query });
    };
    if (this.state.formerQuery !== query) newQuery();
  }

  render() {
    const showDeleteAlert = (quiz) => {
      this.setState({ quizToDelete: quiz, showDeleteQuizAlert: true });
    };
    const deleteQuiz = () => {
      this.state.quizToDelete.applyMethod('delete', []);
      const notifyUser = () => {
        this.setState({ quizDeleted: true });
        setTimeout(() => this.setState({ quizDeleted: false }), 3000);
      };
      notifyUser();
    };
    const forkQuiz = (quiz) => {
      const newQuiz = new Quiz({
        questions: quiz.questions,
        title: quiz.title,
        tags: quiz.tags,
        owner: Meteor.userId(),
      });
      newQuiz.applyMethod('create', []);
      const notifyUser = () => {
        this.setState({ quizForked: true });
        setTimeout(() => this.setState({ quizForked: false }), 3000);
      };
      notifyUser();
    };
    const MoreQuizzesToDisplay = () => {
      this.setState({ quizzesToDisplay: this.state.quizzesToDisplay + 10 });
    };
    const RemoveQuizAlert = () => {
      this.setState({ showDeleteQuizAlert: false });
    };
    const ConfirmOrCancel = () => {
      this.setState({ quizToDelete: null, showDeleteQuizAlert: false });
    };
    const { query } = this.props;
    const actions = {
      showDeleteAlert,
      forkQuiz,
    };
    const actionsForUI = {
      deleteQuiz,
      forkQuiz,
      MoreQuizzesToDisplay,
      RemoveQuizAlert,
      ConfirmOrCancel,
    };

    return <DBProvider query={query} state={this.state} actions={actions} actionsForUI={actionsForUI} />;
  }
}

Search.propTypes = {
  query: PropTypes.string,
};

Search.defaultProps = {
  query: '',
};
