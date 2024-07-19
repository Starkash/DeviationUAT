import { MSGraphClientFactory } from '@microsoft/sp-http';
import { IDeviationProps } from '../../components/IDeviationProps';

export interface IMSGraphInterface {
    getCurrentUserId(): Promise<any>;
    getUserId(userEmail: string): Promise<any>;
    createUsersChat(requesterId: string, receiverPersonId: string): Promise<any>;
    sendMessage(chatId: string, chatMessage: string, props: IDeviationProps): Promise<any>;
}

export default async function msGraphProvider(msGraphClientFactory: MSGraphClientFactory): Promise<IMSGraphInterface> {
    const msGraphClient = await msGraphClientFactory.getClient("3");

    const getUserId = async (userEmail: string) => {
        let resultGraph = await msGraphClient.api(`/users/${userEmail}`).get();
        return resultGraph.id;
    };

    const getCurrentUserId = async () => {
        let resultGraph = await msGraphClient.api(`me`).get();
        return resultGraph.id;
    };

    const createUsersChat = async (requesterId: string, receiverPersonId: string) => {
        let body: any = {
            "chatType": "oneOnOne",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/beta/users('${requesterId}')`
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/beta/users('${receiverPersonId}')`
                }
            ]
        };
        let resultGraph = await msGraphClient.api(`chats`).version("beta").post(body);
        return resultGraph.id;
    };

    const sendMessage = async (chatId: string, chatMessage: string, props: IDeviationProps) => {
        let body = {
            "subject": "Request for Approval",
            "body": {
                "contentType": "html",
                "content": "<attachment id=\"74d20c7f34aa4a7fb74e2b30004247c5\"></attachment>"
            },
            "attachments": [
                {
                    "id": "74d20c7f34aa4a7fb74e2b30004247c5",
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "contentUrl": null,
                    "content": chatMessage,
                    "name": null,
                    "thumbnailUrl": null
                }
            ]
        };
        let resultGraph = await msGraphClient.api(`chats/${chatId}/messages`).version("beta").post(body);
        return resultGraph;
    };

    return {
        getUserId,
        sendMessage,
        createUsersChat,
        getCurrentUserId
    };
}
