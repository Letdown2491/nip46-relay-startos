# Builds the nip46-relay binary from the pinned upstream source.
#
# CGO is disabled so the result is a fully static binary that cross-compiles
# cleanly for every StartOS target arch (x86_64, aarch64, riscv64). The landing
# page (static/index.html) is embedded via go:embed and badger is pure Go, so
# the runtime image needs nothing beyond the binary and CA certificates.

FROM golang:1.25-alpine AS builder

ARG UPSTREAM_REF=v1.0.0

RUN apk add --no-cache git

WORKDIR /src
RUN git clone --depth 1 --branch "${UPSTREAM_REF}" \
    https://github.com/Letdown2491/nip46-relay.git .

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/nip46-relay

FROM alpine:latest

RUN apk add --no-cache ca-certificates

COPY --from=builder /out/nip46-relay /usr/local/bin/nip46-relay

CMD ["/usr/local/bin/nip46-relay"]
