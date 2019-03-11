export default {
	/**
	 * The Package contains debugging information.
	 */
	Debug: 0,
	/**
	 * The Package contains public RSAParameters.
	 */
	RSA: 1,
	/**
	 * The Package contains AesParameters.
	 */
	AES: 2,
	/**
	 * The Package contains nothing but requests a MetaResponse.
	 */
	Meta: 3,
	/**
	 * The Package contains ServerMetaResponsePackageContent.
	 */
	MetaResponse: 4,
	/**
	 * The Package contains RegisterPackageContent.
	 */
	Register: 5,
	/**
	 * The Package contains MemberLoginPackageContent.
	 */
	MemberLogin: 6,
	/**
	 * The Package contains an identity.
	 */
	GuestLogin: 7,
	/**
	 * The Package contains a status message and an identity if the login was successful.
	 */
	LoginResponse: 8,
	/**
	 * The Package contains InputPackageContent.
	 */
	Input: 9,
	/**
	 * The Package contains MessagePackageContent.
	 */
	Message: 10,
	/**
	 * The Package contains nothing but informs the server that the client has finished rendering.
	 */
	LoginFinished: 11,
	/**
	 * The Package contains a list of all channels.
	 */
	ChannelListUpdate: 12,
	/**
	 * The Package contains a list of all groups.
	 */
	GroupListUpdate: 13,
	/**
	 * The Package contains a list of all users.
	 */
	UserListUpdate: 14,
	/**
	 * The Package contains EnterChannelPackageContent.
	 */
	EnterChannel: 15,
	/**
	 * The Package contains EnterChannelResponsePackageContent.
	 */
	EnterChannelResponse: 16,
	GetSettings: 17,
	GetSettingsResponse: 18,
	/**
	 * The Package contains a string requesting a specific settings model.
	 */
	OpenSettings: 19,
	/**
	 * The Package contains OpenSettingsResponsePackageContent.
	 */
	OpenSettingsResponse: 20,
	/**
	 * The Package contains EditSettingsPackageContent.
	 */
	EditSettings: 21,
	/**
	 * The Package contains a bool determining whether the edit was successful or not.
	 */
	EditSettingsResponse: 22,
	/**
	 * The Package contains EditProfilePackageContent.
	 */
	EditProfile: 23,
	/**
	 * The Package contains EditProfileResponsePackageContent.
	 */
	EditProfileResponse: 24,
	/**
	 * The Package contains a dictionary of all known permissions and their human-readable names.
	 */
	KnownPermissionsUpdate: 25,
	/**
	 * The Package contains a string stating the reason for the following disconnect.
	 */
	DisconnectReason: 26,
	/**
	 * The Package contains CreatePunishmentPackageContent.
	 */
	CreatePunishment: 27,
	/**
	 * The Package contains a list of all accounts.
	 */
	AccountListUpdate: 28,
	/**
	 * The Package contains CreateChannelPackageContent.
	 */
	CreateChannel: 29,
	/**
	 * The Package contains MessagePackageContent.
	 */
	Mention: 30,
	/**
	 * The Package contains CreateGroupPackageContent.
	 */
	CreateGroup: 31,
	/**
	 * The Package contains a bool determining whether the creation was successful or not.
	 */
	CreateGroupResponse: 32,
	/**
	 * The Package contains a list of all the permissions the user has been granted.
	 */
	GrantedPermissionsUpdate: 33,
	/**
	 * The Package contains a guid of the group to delete.
	 */
	DeleteGroup: 34,
	/**
	 * The Package contains a bool determining whether the deletion was successful or not.
	 */
	DeleteGroupResponse: 35,
	/**
	 * The Package contains a guid of the channel to delete.
	 */
	DeleteChannel: 36,
	/**
	 * The Package contains a bool determining whether the deletion was successful or not.
	 */
	DeleteChannelResponse: 37,
	/**
	 * The Package contains a guid of the account to unban.
	 */
	DeletePunishment: 38
}