# stage 1: Build
FROM golang:1.26-alpine AS builder
WORKDIR /app

# cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o itsm-backend

# stage 2 run
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# copy the pre built binary
COPY --from=builder /app/itsm-backend .
EXPOSE 8080

# run the binary
CMD [ "./itsm-backend" ]