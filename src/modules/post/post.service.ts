import { json } from "node:stream/consumers";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};




const getAllPosts = async (query: IPostQuery) => {


  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;

  const tagsArray = Array.isArray(tags) ? (tags as string[]) : undefined;

  const andConditions: PostWhereInput[] =[]


  if(query.searchTerm){
    andConditions.push({
      OR:[
        {
        title:{
          contains:query.searchTerm,
          mode:"insensitive"  
        },
      },
      {
        content:{
          contains:query.searchTerm,
          mode:"insensitive"}
      }
      ]

    })
  }

  if(query.title){
    andConditions.push({
      title:query.title
    })
  }

  if(query.authorId){
    andConditions.push({
      authorId:query.authorId
    })
  }

  if(query.isFeatured){
    andConditions.push({
      isFeatured:Boolean(query.isFeatured)
    })
  }

  if(query.tags){
    andConditions.push({
      tags:{
        hasSome:tagsArray
      }
    })
  }

  if(query.status){
    andConditions.push({
      status:query.status
    })
  }


  const posts = await prisma.post.findMany({

    //filtering or exact match

    // where:{
    //     title:"My second Post an updated"
    // },

    // where:{
    //     AND:[
    //         {title:"My second Post an updated"},
    //         {content:"Ronaldo"}
    //     ]
    // },

//searching or partial match


// where:{
//     title:{
//         contains:"10",
//         mode:"insensitive"
//     },
//     content:{
//         contains:"Ronaldo",
//     }
// },

//searching or partial search
// where:{
// OR:[
//   {title:{
//     contains:"10",
//     mode:"insensitive"
//   }},
//   {content:{
//     contains:"Ronaldo",
//     mode:"insensitive"
//   }}
// ]
// },

//combining searching and filtering

// where:{
//   AND:[
//     {
//       OR:[
//         {
//           title:{
//             contains:"First",
//             mode:"insensitive"
//           }
//         },
//         {
//           content:{
//             contains:"Goes",
//             mode:"insensitive"
//           }
//         }
//       ]
//     },
//     {title:"first"},
//     {content:"fir"}
//   ]
// },




//pagination with limit or take and skip or page

// take:1,
// skip:1, //skip=(page-1)*limit


//sorting
// orderBy:{
//   createdAt:"desc",
//   title:"asc"
// },
// where:{
// AND:[

//   query.searchTerm?{
//     OR:[
//       {
//         title:{
//           contains:query.searchTerm,
//           mode:"insensitive"
//         },
//       },
//       {
//         content:{
//           contains:query.searchTerm,
//           mode:"insensitive"}
//       }
//     ]
//   }:{},

//   //title filtering
//   query.title?{title:query.title}:{},

//   //content filtering
//   query.content?{content:query.content}:{},

// ]
// },

// where:{
// AND:andConditions
// },





//dynamic pagination
take:limit,
skip:skip,

orderBy:{

  [sortBy]:sortOrder

},

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};

const getPostById = async (postId: string) => {
  //   await prisma.post.update({
  //     where: {
  //       id: postId,
  //     },
  //     data: {
  //       views: {
  //         increment: 1,
  //       },
  //     },
  //   });

  //   const post = await prisma.post.findUniqueOrThrow({
  //     where: {
  //       id: postId,
  //     },
  //     include: {
  //       author: {
  //         omit: {
  //           password: true,
  //         },
  //       },
  //       comments: {
  //         where: {
  //           status: CommentStatus.APPROVED,
  //         },
  //         orderBy: {
  //           createdAt: "desc",
  //         },
  //       },
  //       _count: {
  //         select: {
  //           comments: true,
  //         },
  //       },
  //     },
  //   });

  //   return post;

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });

    return transactionResult;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not authorized to update this post");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not authorized to update this post");
  }
  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });
  return null;
};

const getPostsStats = async () => {
    const transactionResult=await prisma.$transaction(async(tx)=>{
        // const totalPosts=await tx.post.count();
        // const totalPublishedPosts=await tx.post.count({
        //     where:{
        //         status:PostStatus.PUBLISHED
        //     }
        // });
        // const totalDraftPosts=await tx.post.count({
        //     where:{
        //         status:PostStatus.DRAFT
        //     }
        // });
        // const totalArchivedPosts=await tx.post.count({
        //     where:{
        //         status:PostStatus.ARCHIVED
        //     }
        // });
        // const totalComments=await tx.comment.count();
        // const totalApprovedComments=await tx.comment.count({
        //     where:{
        //         status:CommentStatus.APPROVED
        //     }
        // });
        // const totalRejectedComments=await tx.comment.count({
        //     where:{
        //         status:CommentStatus.REJECT
        //     }
        // });

    //not a good approach
        // const allPosts=await tx.post.findMany();
        // let totalPostViews=0;
        // allPosts.forEach((post)=>{
        //     totalPostViews+=post.views;
        // })

        // const totalPostViewsAggregate=await tx.post.aggregate({
        //     _sum:{
        //         views:true
        //     }
        // })
// const totalPostViews=totalPostViewsAggregate._sum.views;
        // return {
        //     totalPosts,
        //     totalPublishedPosts,
        //     totalDraftPosts,
        //     totalArchivedPosts,
        //     totalComments,
        //     totalApprovedComments,
        //     totalRejectedComments,
        //     totalPostViews
        // }
        const [totalPosts,totalPublishedPosts,totalDraftPosts,totalArchivedPosts,totalComments,totalApprovedComments,totalRejectedComments,totalPostViewsAggregate]=await Promise.all([
        await tx.post.count(),
        await tx.post.count({
            where:{
                status:PostStatus.PUBLISHED
            }
        }),
        await tx.post.count({
            where:{
                status:PostStatus.DRAFT
            }
        }),
        await tx.post.count({
            where:{
                status:PostStatus.ARCHIVED
            }
        }),
        await tx.comment.count(),
        await tx.comment.count({
            where:{
                status:CommentStatus.APPROVED
            }
        }),
        await tx.comment.count({
            where:{
                status:CommentStatus.REJECT
            }
        }),
        await tx.post.aggregate({
            _sum:{
                views:true
            }
        })
    ])
        return {
            totalPosts,
            totalPublishedPosts,
            totalDraftPosts,
            totalArchivedPosts,
            totalComments,
            totalApprovedComments,
            totalRejectedComments,
            totalPostViews:totalPostViewsAggregate._sum.views
        }
    })
    return transactionResult;

};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsStats,
  getMyPosts,
};
