import React, { Component } from "react";
import Moment from 'react-moment';

class HackerCard extends Component {
    render() {
        return (
            <div className={"hacker-card" + " " + this.props.story.type} key={this.props.index}>
                <h2 className='this.props.story-title'>
                    <a href={this.props.calculatedUrl}>
                        {this.props.story.title}
                    </a>
                </h2>
                <div className='this.props.story-url'>{this.props.displayUrl}</div>
                <div className='points-info'>
                    {this.props.story.score} points by {this.props.story.by} | {this.props.story.descendants ? this.props.story.descendants : 0} comments | <Moment unix fromNow>{this.props.story.time}</Moment>
                </div>
                { (this.props.story.type !== 'job') &&
                    <div className='top-comments'>
                        {this.props.topComments !== undefined ? <h3>Top Comments</h3> : ''}
                        {this.props.topComments !== undefined ? this.props.topComments.map((comment, index) =>
                            <div className="comment" key={index}>
                                <div className="comment-by">{comment.by} said:</div>
                                <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }}></div>
                            </div>
                        ) : <div className="no-comments">No comments yet</div>}
                    </div> }

                {
                    (this.props.story.type !== 'job') &&
                    <div className="see-on-hn-overlay">
                        <div className="see-on-hn">
                            <a href={this.props.hnUrl}>Read on HN</a>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default HackerCard;