# TwentyThree CLI

<!-- usage -->
```sh-session
$ npm install -g twentythree-cli
$ twentythree COMMAND
running command...
$ twentythree (--version)
twentythree-cli/0.1.0 darwin-arm64 node-v22.22.2
$ twentythree --help [COMMAND]
USAGE
  $ twentythree COMMAND
...
```
<!-- usagestop -->

<!-- commands -->
# Command Topics

* [`twentythree action`](docs/commands/action.md) - Create a new CTA action on a video or webinar
* [`twentythree action add`](docs/commands/action/add.md) - Create a new CTA action on a video or webinar
* [`twentythree action delete`](docs/commands/action/delete.md) - Delete a CTA action
* [`twentythree action exclude`](docs/commands/action/exclude.md) - Exclude a CTA action from an object (or undo an exclusion)
* [`twentythree action get`](docs/commands/action/get.md) - Get details of a CTA action
* [`twentythree action include`](docs/commands/action/include.md) - Include an object in a CTA action scope (or undo an inclusion)
* [`twentythree action list`](docs/commands/action/list.md) - List CTA actions for a video, webinar, or object
* [`twentythree action types`](docs/commands/action/types.md) - List available CTA action types
* [`twentythree action update`](docs/commands/action/update.md) - Update an existing CTA action
* [`twentythree action upload`](docs/commands/action/upload.md) - Upload a file to an action variable
* [`twentythree analytics`](docs/commands/analytics.md) - Get conversion analytics data
* [`twentythree analytics conversions`](docs/commands/analytics/conversions.md) - Get conversion analytics data
* [`twentythree analytics live`](docs/commands/analytics/live.md) - Get live/webinar analytics data
* [`twentythree analytics usage`](docs/commands/analytics/usage.md) - Get usage analytics by device type
* [`twentythree analytics video`](docs/commands/analytics/video.md) - Get video analytics data
* [`twentythree app`](docs/commands/app.md) - Create a new app integration
* [`twentythree app add`](docs/commands/app/add.md) - Create a new app integration
* [`twentythree app delete`](docs/commands/app/delete.md) - Delete an app integration from the active workspace
* [`twentythree app update`](docs/commands/app/update.md) - Update an existing app integration
* [`twentythree audience`](docs/commands/audience.md) - List audience companies
* [`twentythree audience companies`](docs/commands/audience/companies.md) - List audience companies
* [`twentythree audience field`](docs/commands/audience/field.md) - List custom audience fields
* [`twentythree audience funnel`](docs/commands/audience/funnel.md) - Get audience funnel analytics
* [`twentythree audience identity-sources`](docs/commands/audience/identity-sources.md) - List audience identity sources
* [`twentythree audience list`](docs/commands/audience/list.md) - List audience members
* [`twentythree audience list-collectors`](docs/commands/audience/list-collectors.md) - List collectors linked to audience
* [`twentythree audience metrics`](docs/commands/audience/metrics.md) - Get audience aggregate metrics
* [`twentythree audience register`](docs/commands/audience/register.md) - Register an audience contact
* [`twentythree audience remove`](docs/commands/audience/remove.md) - Permanently remove an audience contact
* [`twentythree audience search`](docs/commands/audience/search.md) - Search audience members
* [`twentythree audience timelines`](docs/commands/audience/timelines.md) - Get audience member timelines
* [`twentythree audience unregister`](docs/commands/audience/unregister.md) - Remove a registration for an audience contact
* [`twentythree auth`](docs/commands/auth.md) - Configure domain and bearer token for a TwentyThree workspace
* [`twentythree auth credentials`](docs/commands/auth/credentials.md) - Configure domain and bearer token for a TwentyThree workspace
* [`twentythree auth status`](docs/commands/auth/status.md) - Show authentication status and active workspace
* [`twentythree category`](docs/commands/category.md) - Manage categories — list, create, update, and delete
* [`twentythree category create`](docs/commands/category/create.md) - Create a new category
* [`twentythree category delete`](docs/commands/category/delete.md) - Delete a category from the active workspace
* [`twentythree category list`](docs/commands/category/list.md) - List categories in the active workspace
* [`twentythree category update`](docs/commands/category/update.md) - Update metadata for a category
* [`twentythree collector`](docs/commands/collector.md) - Block a collector from a video or webinar
* [`twentythree collector exclude`](docs/commands/collector/exclude.md) - Block a collector from a video or webinar
* [`twentythree collector include`](docs/commands/collector/include.md) - Attach a collector to a video or webinar
* [`twentythree collector list`](docs/commands/collector/list.md) - List collectors in the active workspace
* [`twentythree comment`](docs/commands/comment.md) - Add a comment to an object
* [`twentythree comment add`](docs/commands/comment/add.md) - Add a comment to an object
* [`twentythree comment clone`](docs/commands/comment/clone.md) - Clone an existing comment
* [`twentythree comment delete`](docs/commands/comment/delete.md) - Delete a comment
* [`twentythree comment list`](docs/commands/comment/list.md) - List comments in the active workspace
* [`twentythree comment promote`](docs/commands/comment/promote.md) - Promote or toggle promoted status of a comment
* [`twentythree comment reaction`](docs/commands/comment/reaction.md) - Add a reaction to a comment
* [`twentythree comment set-order`](docs/commands/comment/set-order.md) - Set display order of comments on an object
* [`twentythree comment update`](docs/commands/comment/update.md) - Update a comment's status
* [`twentythree doctor`](docs/commands/doctor.md) - Check CLI credentials, connectivity, and token validity
* [`twentythree openupload`](docs/commands/openupload.md) - List open upload tokens in the active workspace
* [`twentythree openupload list`](docs/commands/openupload/list.md) - List open upload tokens in the active workspace
* [`twentythree openupload update-file`](docs/commands/openupload/update-file.md) - Update metadata for an open upload entry
* [`twentythree openupload upload-file`](docs/commands/openupload/upload-file.md) - Upload a file via an open upload token using the chunked upload engine
* [`twentythree player`](docs/commands/player.md) - Delete a player from the active workspace
* [`twentythree player delete`](docs/commands/player/delete.md) - Delete a player from the active workspace
* [`twentythree player embed`](docs/commands/player/embed.md) - Generate embed code for a video, webinar, or category
* [`twentythree player embed-versions`](docs/commands/player/embed-versions.md) - List available embed versions for an object
* [`twentythree player list`](docs/commands/player/list.md) - List players in the active workspace
* [`twentythree player styles`](docs/commands/player/styles.md) - List available player visual styles
* [`twentythree player update`](docs/commands/player/update.md) - Update settings for a player
* [`twentythree poll`](docs/commands/poll.md) - Create a new poll for a webinar
* [`twentythree poll add`](docs/commands/poll/add.md) - Create a new poll for a webinar
* [`twentythree poll answer`](docs/commands/poll/answer.md) - Submit a poll answer
* [`twentythree poll list`](docs/commands/poll/list.md) - List polls for a webinar
* [`twentythree poll remove`](docs/commands/poll/remove.md) - Remove a poll
* [`twentythree poll set-options`](docs/commands/poll/set-options.md) - Set options for a poll
* [`twentythree poll update`](docs/commands/poll/update.md) - Update a poll
* [`twentythree presentation`](docs/commands/presentation.md) - List available presentation page link locations
* [`twentythree presentation page`](docs/commands/presentation/page.md) - List available presentation page link locations
* [`twentythree presentation setting`](docs/commands/presentation/setting.md) - List workspace presentation settings
* [`twentythree protection`](docs/commands/protection.md) - Apply protection to content
* [`twentythree protection protect`](docs/commands/protection/protect.md) - Apply protection to content
* [`twentythree protection unprotect`](docs/commands/protection/unprotect.md) - Remove protection from content
* [`twentythree protection verify`](docs/commands/protection/verify.md) - Verify access to protected content
* [`twentythree session`](docs/commands/session.md) - Get a session access token
* [`twentythree session get-token`](docs/commands/session/get-token.md) - Get a session access token
* [`twentythree session redeem-token`](docs/commands/session/redeem-token.md) - Redeem a session token
* [`twentythree setting`](docs/commands/setting.md) - Update workspace settings (key=value pairs)
* [`twentythree setting update`](docs/commands/setting/update.md) - Update workspace settings (key=value pairs)
* [`twentythree site`](docs/commands/site.md) - Get site settings for the active workspace
* [`twentythree site get`](docs/commands/site/get.md) - Get site settings for the active workspace
* [`twentythree site search`](docs/commands/site/search.md) - Search for content across the active workspace
* [`twentythree spot`](docs/commands/spot.md) - Get details of a specific spot
* [`twentythree spot check`](docs/commands/spot/check.md) - Get details of a specific spot
* [`twentythree spot create`](docs/commands/spot/create.md) - Create a new spot
* [`twentythree spot delete`](docs/commands/spot/delete.md) - Delete a spot from the active workspace
* [`twentythree spot list`](docs/commands/spot/list.md) - List spots in the active workspace
* [`twentythree spot reset-version`](docs/commands/spot/reset-version.md) - Reset the version of a spot
* [`twentythree spot set-videos`](docs/commands/spot/set-videos.md) - Assign videos to a spot
* [`twentythree spot update`](docs/commands/spot/update.md) - Update a spot
* [`twentythree tag`](docs/commands/tag.md) - List tags in the active workspace
* [`twentythree tag list`](docs/commands/tag/list.md) - List tags in the active workspace
* [`twentythree tag related`](docs/commands/tag/related.md) - List tags related to a given tag
* [`twentythree thumbnail`](docs/commands/thumbnail.md) - Manage thumbnail templates — list, add, update, delete, duplicate, data, and manage files
* [`twentythree thumbnail add`](docs/commands/thumbnail/add.md) - Create a new thumbnail template
* [`twentythree thumbnail data`](docs/commands/thumbnail/data.md) - Get Liquid render data for a thumbnail template and object
* [`twentythree thumbnail delete`](docs/commands/thumbnail/delete.md) - Delete a thumbnail template from the active workspace
* [`twentythree thumbnail duplicate`](docs/commands/thumbnail/duplicate.md) - Duplicate a thumbnail template
* [`twentythree thumbnail file`](docs/commands/thumbnail/file.md) - Delete a file from a thumbnail template
* [`twentythree thumbnail list`](docs/commands/thumbnail/list.md) - List thumbnail templates in the active workspace
* [`twentythree thumbnail update`](docs/commands/thumbnail/update.md) - Update a thumbnail template
* [`twentythree user`](docs/commands/user.md) - Create a new user
* [`twentythree user create`](docs/commands/user/create.md) - Create a new user
* [`twentythree user get`](docs/commands/user/get.md) - Get details of a specific user
* [`twentythree user get-login-token`](docs/commands/user/get-login-token.md) - Generate a login token for a user
* [`twentythree user list`](docs/commands/user/list.md) - List users in the workspace
* [`twentythree user redeem-login-token`](docs/commands/user/redeem-login-token.md) - Redeem a login token to authenticate a user
* [`twentythree user send-invitation`](docs/commands/user/send-invitation.md) - Send an invitation email to a user
* [`twentythree user tokens`](docs/commands/user/tokens.md) - Retrieve cross-site tokens for the authenticated user
* [`twentythree user update`](docs/commands/user/update.md) - Update a user profile
* [`twentythree video`](docs/commands/video.md) - Manage videos — upload, list, update, delete, and more
* [`twentythree video delete`](docs/commands/video/delete.md) - Delete a video from the active workspace
* [`twentythree video frame`](docs/commands/video/frame.md) - Extract a frame from a video
* [`twentythree video get`](docs/commands/video/get.md) - Get details of a specific video
* [`twentythree video list`](docs/commands/video/list.md) - List videos in the active workspace
* [`twentythree video replace`](docs/commands/video/replace.md) - Replace the video file for an existing video
* [`twentythree video section`](docs/commands/video/section.md) - Manage video sections (chapters)
* [`twentythree video subtitle`](docs/commands/video/subtitle.md) - Manage video subtitles and captions
* [`twentythree video transcoding-progress`](docs/commands/video/transcoding-progress.md) - Check the transcoding progress for a video
* [`twentythree video update`](docs/commands/video/update.md) - Update metadata for a video
* [`twentythree video upload`](docs/commands/video/upload.md) - Upload a video file to the active workspace
* [`twentythree webhook`](docs/commands/webhook.md) - List available webhook event types
* [`twentythree webhook events`](docs/commands/webhook/events.md) - List available webhook event types
* [`twentythree webhook list`](docs/commands/webhook/list.md) - List webhook subscriptions for the active workspace
* [`twentythree webhook sample`](docs/commands/webhook/sample.md) - Get a sample payload for a webhook event type
* [`twentythree webhook subscribe`](docs/commands/webhook/subscribe.md) - Subscribe to a webhook event
* [`twentythree webhook unsubscribe`](docs/commands/webhook/unsubscribe.md) - Unsubscribe from a webhook event
* [`twentythree webinar`](docs/commands/webinar.md) - Manage webinars — create, list, update, delete, and more
* [`twentythree webinar attachment`](docs/commands/webinar/attachment.md) - Delete an attachment from a webinar
* [`twentythree webinar clips`](docs/commands/webinar/clips.md) - List recording clips from a webinar
* [`twentythree webinar create`](docs/commands/webinar/create.md) - Create a new webinar
* [`twentythree webinar delete`](docs/commands/webinar/delete.md) - Delete a webinar from the active workspace
* [`twentythree webinar highlights`](docs/commands/webinar/highlights.md) - List highlights from a webinar
* [`twentythree webinar list`](docs/commands/webinar/list.md) - List webinars in the active workspace
* [`twentythree webinar list-formats`](docs/commands/webinar/list-formats.md) - List available webinar formats
* [`twentythree webinar log`](docs/commands/webinar/log.md) - Retrieve the event log for a webinar
* [`twentythree webinar mail`](docs/commands/webinar/mail.md) - Add an email to a webinar
* [`twentythree webinar metrics`](docs/commands/webinar/metrics.md) - Retrieve metrics for a webinar
* [`twentythree webinar queued-video`](docs/commands/webinar/queued-video.md) - Add a queued video to a webinar
* [`twentythree webinar recording`](docs/commands/webinar/recording.md) - Split the current recording into a new segment
* [`twentythree webinar repeat`](docs/commands/webinar/repeat.md) - Duplicate a webinar and schedule the copy at a new date/time
* [`twentythree webinar room`](docs/commands/webinar/room.md) - Get connection info for a webinar room
* [`twentythree webinar section`](docs/commands/webinar/section.md) - Add an agenda section to a webinar
* [`twentythree webinar series`](docs/commands/webinar/series.md) - Apply a recurrence to a webinar series
* [`twentythree webinar speaker`](docs/commands/webinar/speaker.md) - Add a speaker to a webinar
* [`twentythree webinar transcription`](docs/commands/webinar/transcription.md) - Connect a transcription to a webinar
* [`twentythree webinar update`](docs/commands/webinar/update.md) - Update details for a webinar
* [`twentythree webinar upload-image`](docs/commands/webinar/upload-image.md) - Upload an image for a webinar (thumbnail, preview, or before-webinar)
* [`twentythree workspace`](docs/commands/workspace.md) - List all configured workspaces
* [`twentythree workspace list`](docs/commands/workspace/list.md) - List all configured workspaces
* [`twentythree workspace use`](docs/commands/workspace/use.md) - Switch the active workspace

<!-- commandsstop -->
