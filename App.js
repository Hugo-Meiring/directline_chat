import React from 'react'
import { Platform, View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { GiftedChat } from 'react-native-gifted-chat'
import emojiUtils from 'emoji-utils'

import SlackMessage from './SlackMessage'
import { DirectLine, ConnectionStatus } from './directline/directLine'
// import { DirectLine, ConnectionStatus } from 'botframework-directlinejs'


export default class App extends React.Component {
	state = {
		messages: [],
		directLine: null
	}

	async componentDidMount() {
		this.setupChat()
		// React native gifted chat ids
		this.userId = 1
		this.serverId = 2

		// Directline secret ids
		this.watermark = ''
		this.conversationId = null

		this.setState({
			messages: [],
			connectionStatus: "Status: Unintialized 💨",	// Used to visualy see directline connection status	
			directLineToken: ''
		})
	}

	// Connect to open websocket directline
	createConnection(token) {
		this.directLine = new DirectLine({
			token: token,
			webSocket: true,
			watermark: this.watermark
		})
		
		// Save token for later reconnects if needed
		this.setState({ directLineToken: token })
	}

	// Send Welcome message
	initializeChatWithWelcome() {
		this.onSend([{
			_id: 1,
			text: 'welcome',
			createdAt: new Date(),
			user: {
				_id: this.userId,
				name: 'Me',
				avatar: 'https://placeimg.com/140/140/any',
			}
		}])
	}

	// Listen for message + connection status
	subscribeToDirectlineEvents() {
		this.directLine.activity$.subscribe(
			activity => this.onReceive(activity)
		)
	}

	// Subscribe to connection status
	subscribeToConnectionStatus() {
		this.directLine.connectionStatus$
			.subscribe(async connectionStatus => {
				switch (connectionStatus) {
					// the status when the DirectLine object is first created/constructed
					case ConnectionStatus.Uninitialized: {
						this.setState({connectionStatus: 'Status: Unintialized 💨'})
						break;
					}
					
					// currently trying to connect to the conversation
					case ConnectionStatus.Connecting: {
						this.setState({connectionStatus: 'Status: Connection 🧩'})
						break;
					}

					// successfully connected to the converstaion. Connection is healthy so far as we know.
					case ConnectionStatus.Online: {
						this.setState({connectionStatus: 'Status: Online 🧪'})

						// Save conversation id for later
						this.conversationId = this.directLine.conversationId
						break;
					}

					// last operation errored out with an expired token. Your app should supply a new one.
					case ConnectionStatus.ExpiredToken: {
						this.setState({connectionStatus: 'Status: Expired token 〽️'})
						console.log('Status: Expired token 〽️')

						var conversation = this.directLine
						conversation.token = this.state.directLineToken

						// This doesn't work as intended
						await this.directLine.reconnect(conversation)
						return
					}

					// the initial attempt to connect to the conversation failed. No recovery possible.
					case ConnectionStatus.FailedToConnect: {
						// TODO: Log this type of failure
						// TODO: Display to the user a message
						this.setState({connectionStatus: 'Status: Failed 🚩'})
						break;
					}

					 // the bot ended the conversation
					case ConnectionStatus.Ended: {
						this.setState({connectionStatus: 'Status: Ended 🐁'})
						break;
					}

					default: {
						this.setState({connectionStatus: 'Status: ⁉️'})
					}
				}
			})
	}

	reconnectToDirectline() {
		console.log('🍗 Unsubscribe to all chats')
		// Kill old connection, try afresh
		// Doesn't work as expected
		this.unsubscribeToAll()

		// Resume chat
		this.setupChat()
	}

	unsubscribeToAll() {
		this.directLine.connectionStatus$.unsubscribeToAll
		this.directLine.activity$.unsubscribeToAll
	}

	async setupChat() {
		let token = await this.fetchDirectLineToken()

		if (token) {
			this.createConnection(token)
			this.initializeChatWithWelcome()
			this.subscribeToDirectlineEvents()
			this.subscribeToConnectionStatus()
		} else {
			this.setState({connectionStatus: 'Status: Failed 🚩'})
		}
	}

	async refreshToken() {
		let token = await this.fetchDirectLineToken()
		this.directLine.token = token
		debugger
	}

	// Generate a new token
	async fetchDirectLineToken(timeOut = 1000) {
		// Get Directline token from server
		try {
			const response = await fetch('https://<< token generation endpoint >>', { method: 'POST' })

			if (response.status == 200) {
				const json = await response.json()
				console.log('🌀 Fetching directline token:\n' + JSON.stringify(json))
				return json.token
			} else {
				throw 'Failed to fetch directline token, retrying'
			}
		} catch (error) {
			return null
		}
	}

	// Receive message from server
	onReceive(activity) {
		console.log("🧪 Received activity: ", activity)

		if (this.directLine && this.directLine.watermark && this.directLine.watermark != this.watermark) {
			this.watermark = this.directLine.watermark
			console.log('💦 ' + this.watermark)
		}

		let nextMessageId = this.state.messages.length + 1
		let messageReceived = {
			_id: nextMessageId,
			text: activity.text,
			createdAt: new Date(),
			user: {
				_id: this.serverId,
				name: 'Server',
				avatar: 'https://placeimg.com/140/140/any',
			},
		}

		// If message is an acknowledgement show checkmark
		let currentMessages = this.state.messages
		let isAcknowledgement = false
		
		// Check if message has already been sent / received
		currentMessages.forEach((message, index) => {
			if (message.text == messageReceived.text) {
				isAcknowledgement = true
				return
			}
		})

		// If message is seen for second time, place a tick next to it
		if (isAcknowledgement) { 
			messageReceived.text = "(✓) " + messageReceived.text
			// return	// Do not show acknowledgement messages
		}

		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, messageReceived),
		}), () => {
			// Built in failure for testing ConnectionStatus.ExpiredToken
			if (this.state.messages.length == 7) {
				// Expire token
				console.log('Causing token to fail 🔫')
				this.directLine.token = 'gewgweewg'
			}
		})
	}

	// Send message to via directline
	async onSend(messages = []) {
		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}))

		// Send message via directline
		let sentSuccessful = await new Promise(resolve => {this.directLine.postActivity({
			from: { id: 'myUserId', name: 'myUserName' },
			type: 'message',
			text: messages[0].text,
			user: messages[0].user,
			quickReplies: messages[0].quickReplies
		}).subscribe(
			id => {
				console.log("🦋 Posted activity, assigned ID ", id) 

				// Resend message if you receive a result of retry
				if (id == 'retry') {
					// this.onSend(messages)
					resolve(false)
				} else {
					resolve(true)
				}
			},
			error => {
				// This gets hit 3 times when preventing new websockets from opening
				console.log("🔺 Error posting activity::\n\t\t\t", error)
				var conversation = this.directLine
				conversation.token = this.state.directLineToken
				this.reconnectToDirectline()
			}
		)})

		if (!sentSuccessful) {
			console.log('🥗 Retrying ....')
			this.onSend(messages)
		}
	}

	// The following below is just for rendering UI, nothing to do with directline
	renderMessage(props) {
		const {
			currentMessage: { text: currText },
		} = props

		let messageTextStyle

		// Make "pure emoji" messages much bigger than plain text.
		if (currText && emojiUtils.isPureEmojiString(currText)) {
			messageTextStyle = {
				fontSize: 28,
				// Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
				lineHeight: Platform.OS === 'android' ? 34 : 30,
			}
		}

		return <SlackMessage {...props} messageTextStyle={messageTextStyle} />
	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.text}>{this.state.connectionStatus}</Text>
				<GiftedChat
					messages={this.state.messages}
					onSend={messages => this.onSend(messages)}
					user={{
						_id: this.userId,
					}}
					renderMessage={this.renderMessage}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	text: {
		textAlign: "right",
		marginTop: 70,
		marginRight:40
	}
})
