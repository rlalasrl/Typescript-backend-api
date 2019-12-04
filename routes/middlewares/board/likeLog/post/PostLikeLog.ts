import { NextFunction,  Request, Response } from 'express';

import { PostLikeLogRequest } from './_validation';

import Board from '../../../../../database/models/board.model';
import BoardLike from '../../../../../database/models/boardlike.model';
import BoardLikeLog from '../../../../../database/models/boardLikeLog.model';
import User from '../../../../../database/models/user.model';
import CustomError from '../../../error/customError';

const likeBoardLog = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;
    const { board_pk }: PostLikeLogRequest['body'] = req.body;
    const { like_pk }: PostLikeLogRequest['body'] = req.body;
    
    const boardLike: BoardLike = await BoardLike.findOne({
        where: {
            pk: user.pk,
            board_pk,
            like: true,
        },
    });

    if(!boardLike || (boardLike.like === !typeof(Boolean))) {
        res.status(412).json({
            result: {
                SUCCESS: false,
                message: '이 게시물은 좋아요가 달려있지 않아서 저장에 담을 수 없습니다',
            },
        });
    } else if (boardLike.like === false) {
        res.status(412).json({
            result: {
                SUCCSS: false,
                message: '좋아요가 없는 게시물은 저장할 수 없습니다.',
            },
        });
    } else {
        
        const board: Board | undefined = await Board.findOne({
          where: {
            board_pk,
            like_pk,
          },
        });

        if (board) {
            const LikeLog: BoardLikeLog = await BoardLikeLog.create({
                board_pk,
                like_pk,
                user_name: user.name,
                board_title: board.title,
                board_content: board.content,
                author: board.author,
            });
    
            if(!LikeLog) {
                res.status(520).json({
                    result: {
                        SUCCESS: false,
                        message: 'DB error',
                    },
                });
            } else {
                res.status(200).json({
                    result: {
                        SUCCESS: true,
                        message: '저장돤 항목이 있습니다.',
                    },
                });
            }
        } else {
            next(new CustomError({ name: 'Database_Error' }));
        }
    }
}

export default likeBoardLog;