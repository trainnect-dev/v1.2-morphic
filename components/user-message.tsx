import { Message } from 'ai'
import Image from 'next/image'
import React from 'react'
import { CollapsibleMessage } from './collapsible-message'

type UserMessageProps = {
  message: Message | string
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  // Handle both string messages and Message objects
  const content = typeof message === 'string' ? message : message.content
  const attachments = typeof message === 'object' ? message.experimental_attachments : undefined
  
  return (
    <CollapsibleMessage role="user">
      <div className="flex-1 break-words w-full">
        <div>{content}</div>
        
        {/* Display attachments if present */}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => {
              if (attachment.contentType?.startsWith('image/')) {
                // Display images
                return (
                  <div key={`attachment-${index}`} className="relative border border-border rounded-md overflow-hidden">
                    <Image
                      src={attachment.url}
                      alt={attachment.name || `Image ${index + 1}`}
                      width={300}
                      height={200}
                      className="object-contain max-h-[300px]"
                    />
                    {attachment.name && (
                      <div className="text-xs text-muted-foreground p-1 bg-background/80 absolute bottom-0 left-0 right-0 truncate">
                        {attachment.name}
                      </div>
                    )}
                  </div>
                )
              } else if (attachment.contentType === 'application/pdf') {
                // Display PDFs
                return (
                  <div key={`attachment-${index}`} className="w-full max-w-xl border border-border rounded-md overflow-hidden">
                    <div className="bg-accent p-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-sm font-medium truncate">
                        {attachment.name || 'PDF Document'}
                      </span>
                    </div>
                    <iframe
                      src={attachment.url}
                      title={attachment.name || `PDF ${index + 1}`}
                      className="w-full h-[400px] border-t border-border"
                    />
                  </div>
                )
              } else {
                // Display other file types as links
                return (
                  <div key={`attachment-${index}`} className="flex items-center gap-2 p-2 border border-border rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {attachment.name || `File ${index + 1}`}
                    </a>
                  </div>
                )
              }
            })}
          </div>
        )}
      </div>
    </CollapsibleMessage>
  )
}
