//
//  Models.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Foundation

struct Message: Encodable, Decodable {
    let id: UUID
    let createdAt: Date
    let fridgeID: UUID
    let senderID: UUID
    let link: String
    
    var note: String
    var isReadByFridge: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case fridgeID = "fridge_id"
        case senderID = "sender_id"
        case link
        
        case note
        case isReadByFridge = "is_read_by_fridge"
    }
}