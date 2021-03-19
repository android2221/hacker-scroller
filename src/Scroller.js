import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import Moment from 'react-moment';
import './Scroller.scss';

class Scroller extends Component {
    constructor() {
        super();
        this.state = {
            topStories: [],
            storyData: [],
            currentStoriesSlice: [],
            displayData: [],
            currentOffset: 10,
            storiesToLoad: 10,
            loading: true,
        }
        this.mounted = false;
    }

    async componentDidMount() {
        this.mounted = true;
        if (this.mounted){
            await this.getData(); 
            document.addEventListener('scroll', this.trackScrolling);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    trackScrolling = async () => {
        const wrappedElement = document.getElementById('bottom-element');
        if (this.isBottom(wrappedElement)) {
            if (!this.state.loading){
                await this.getData();
            }
        }
    };

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= (window.innerHeight + 1);
    }

    async getData() {
        this.setState({ loading: true });
        var startIndex = this.state.currentOffset - this.state.storiesToLoad;

        const topStoriesResult = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
        const topStoriesJson = await topStoriesResult.json();
        const currentStoriesSlice = topStoriesJson.slice(startIndex, this.state.currentOffset);

        var storyDataArray = await Promise.all(currentStoriesSlice.map(async (x) => {
            var storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${x}.json`);
            var story = await storyResponse.json();
            if (story.kids) {
                var topComments = await Promise.all(story.kids.slice(0, 10).map(async comment => {
                    var result = await fetch(`https://hacker-news.firebaseio.com/v0/item/${comment}.json`);
                    return await result.json();
                }));
            }

            return { story: story, topComments: topComments }

        }));

        var currentDataArray = this.state.storyData;

        currentDataArray.push(...storyDataArray);

        var newOffset = this.state.currentOffset + this.state.storiesToLoad;

        var displayData = [];

        if (this.state.storyData !== undefined) {
            displayData = this.state.storyData.map((x, index) => {
                const story = x.story;
                const topComments = x.topComments;

                // Handle things that don't have a URL
                // Go to hacker news if not

                var calculatedUrl;
                var displayUrl;
                var hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;

                if (story.url) {
                    var urlParts = story.url.split('/');
                    calculatedUrl = story.url;
                    displayUrl = urlParts[2];
                } else {
                    displayUrl = 'news.ycombinator.com';
                    calculatedUrl = `https://news.ycombinator.com/item?id=${story.id}`;
                }

                return (
                    <div className="hacker-card" key={index}>
                        <h2 className='story-title'>
                            <a href={calculatedUrl}>
                                {story.title}
                            </a>
                        </h2>
                        <div className='story-url'>{displayUrl}</div>
                        <div className='points-info'>
                            {story.score} points by {story.by} | {story.descendants ? story.descendants : 0} comments | <Moment unix fromNow>{story.time}</Moment>
                        </div>
                        <div className='top-comments'>
                            {topComments !== undefined ? <h3>Top Comments</h3> : ''}
                            {topComments !== undefined ? topComments.map((comment, index) =>
                                <div className="comment" key={index}>
                                    <div className="comment-by">{comment.by} said:</div>
                                    <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }}></div>
                                </div>
                            ) : <div className="no-comments">No comments yet</div>}
                        </div>
                        <div className="see-on-hn-overlay">
                            <div className="see-on-hn">
                                <a href={hnUrl}>Read on HN</a>
                            </div>
                        </div>
                    </div>
                )
            });
        }

        this.setState({
            topStories: topStoriesJson,
            storyData: currentDataArray,
            currentStoriesSlice: currentStoriesSlice,
            currentOffset: newOffset,
            displayData: displayData,
            loading: false
        });
    }


    render() {
        if (this.state.displayData.length > 0) {
            return (
                <div className='scroller-container'>
                    {this.state.displayData}
                    <div id="bottom-element"></div>
                    <div id='loading-icon-container'>
                        <div id='loading-icon' className="loading">
                            <ClipLoader size={35} color='black' loading={this.state.loading} />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div id='loading-icon' className='loading'>
                <ClipLoader size={35} color='black' loading={this.state.loading} />
            </div>
        );
    }
}

export default Scroller;