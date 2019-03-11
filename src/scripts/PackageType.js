export default {
	/**
	 * The package contains debugging information.
	 */
	Debug: 0,
	/**
	 * The package contains public RSAParameters.
	 */
	RSA: 1,
	/**
	 * The package contains AesParameters.
	 */
	AES: 2,
	/**
	 * The package contains nothing but requests a MetaResponse.
	 */
	Meta: 3,
	/**
	 * The package contains ServerMetaResponsePackageContent.
	 */
	MetaResponse: 4,
	/**
	 * The package contains RegisterPackageContent.
	 */
	Register: 5,
	/**
	 * The package contains MemberLoginPackageContent.
	 */
	MemberLogin: 6,
	/**
	 * The package contains an identity.
	 */
	GuestLogin: 7,
	/**
	 * The package contains a status message and an identity if the login was successful.
	 */
	LoginResponse: 8,
	/**
	 * The package contains InputPackageContent.
	 */
	Input: 9,
	/**
	 * The package contains MessagePackageContent.
	 */
	Message: 10,
	/**
	 * The package contains nothing but informs the server that the client has finished rendering.
	 */
	LoginFinished: 11,
	/**
	 * The package contains a list of all channels.
	 */
	ChannelListUpdate: 12,
	/**
	 * The package contains a list of all groups.
	 */
	GroupListUpdate: 13,
	/**
	 * The package contains a list of all users.
	 */
	UserListUpdate: 14,
	/**
	 * The package contains EnterChannelPackageContent.
	 */
	EnterChannel: 15,
	/**
	 * The package contains EnterChannelResponsePackageContent.
	 */
	EnterChannelResponse: 16,
	GetSettings: 17,
	GetSettingsResponse: 18,
	/**
	 * The package contains a string requesting a specific settings model.
	 */
	OpenSettings: 19,
	/**
	 * The package contains OpenSettingsResponsePackageContent.
	 */
	OpenSettingsResponse: 20,
	/**
	 * The package contains EditSettingsPackageContent.
	 */
	EditSettings: 21,
	/**
	 * The package contains a bool determining whether the edit was successful or not.
	 */
	EditSettingsResponse: 22,
	/**
	 * The package contains EditProfilePackageContent.
	 */
	EditProfile: 23,
	/**
	 * The package contains EditProfileResponsePackageContent.
	 */
	EditProfileResponse: 24,
	/**
	 * The package contains a dictionary of all known permissions and their human-readable names.
	 */
	KnownPermissionsUpdate: 25,
	/**
	 * The package contains a string stating the reason for the following disconnect.
	 */
	DisconnectReason: 26,
	/**
	 * The package contains CreatePunishmentPackageContent.
	 */
	CreatePunishment: 27,
	/**
	 * The package contains a list of all accounts.
	 */
	AccountListUpdate: 28,
	/**
	 * The package contains CreateChannelPackageContent.
	 */
	CreateChannel: 29,
	/**
	 * The package contains MessagePackageContent.
	 */
	Mention: 30,
	/**
	 * The package contains CreateGroupPackageContent.
	 */
	CreateGroup: 31,
	/**
	 * The package contains a bool determining whether the creation was successful or not.
	 */
	CreateGroupResponse: 32,
	/**
	 * The package contains a list of all the permissions the user has been granted.
	 */
	GrantedPermissionsUpdate: 33,
	/**
	 * The package contains a guid of the group to delete.
	 */
	DeleteGroup: 34,
	/**
	 * The package contains a bool determining whether the deletion was successful or not.
	 */
	DeleteGroupResponse: 35,
	/**
	 * The package contains a guid of the channel to delete.
	 */
	DeleteChannel: 36,
	/**
	 * The package contains a bool determining whether the deletion was successful or not.
	 */
	DeleteChannelResponse: 37,
	/**
	 * The package contains a guid of the account to unban.
	 */
    DeletePunishment: 38,
    /**
     * The package contains a byte representation of an image to use as an avatar.
     */
	SetAvatar: 39
}